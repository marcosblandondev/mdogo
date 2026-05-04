# Bayesian Model Bug Fixes — Design Spec

**Date:** 2026-05-02  
**Scope:** Fix four mathematical bugs in `bayes_model.py` and move hardcoded probability tables to JSON files.  
**Out of scope:** UI, API contract, `estimation_service.py`, `server.py`.  
**Future work:** Iterative Proportional Fitting (IPF) to de-correlate the colony/Americas-region double-count signal.

---

## Background

The current Bayesian model in `backend/bayes_model.py` computes:

```
log P(R | C, M, L) ∝ log P(R) + log P(C|R) + log P(M|C,R) + Σ log P(L|R)
```

A code audit and literature review identified four bugs that reduce model accuracy:

1. `p_m_given_c_r` weights are not normalized — not valid conditional probabilities
2. `p_l_given_r` uses multipliers > 1.0 as probabilities — invalid in log-posterior
3. Correlated cultural tags are treated as independent, inflating the signal
4. `_load_priors()` averages across all colonies, discarding the destination signal

**Key references:**
- Micheletti et al. 2020 (PMC7413858) — SlaveVoyages as benchmark, destination-specific discordances
- BISG/BIFSG methodology (arxiv 2304.09126) — Bayesian combination of correlated signals
- PMC2817289 — cultural trait clustering and correlation removal

---

## Files Changed

```
backend/
├── bayes_model.py                          ← updated
├── data_pipeline/
│   ├── pipeline_colony_stats.py            ← audited, minor update if needed
│   ├── migration_weights.json              ← new (replaces p_m_given_c_r)
│   ├── cultural_tag_likelihoods.json       ← new (replaces p_l_given_r)
│   └── tag_clusters.json                   ← new (cluster definitions)
```

---

## Fix 1 — Normalize `migration_weights.json` (fixes `p_m_given_c_r`)

### Problem
Current hardcoded `p_m_given_c_r` values do not sum to 1.0 per `(region, colony)` pair:
```python
"region_senegambia": {"Pacific Colombia": 0.3, "Bahia Coast": 0.3}  # sums to 0.6
```
These are scalars, not conditional probabilities. The log-posterior is not properly calibrated.

### Fix
Move the table to `migration_weights.json` with the same structure. At startup, `bayes_model.py` normalizes each `(region, colony)` row:

```python
for region, colonies in migration_weights.items():
    for colony, destinations in colonies.items():
        total = sum(destinations.values())
        migration_weights[region][colony] = {k: v / total for k, v in destinations.items()}
```

After normalization, `P(M | C, R)` sums to 1.0 over all Americas sub-regions for each `(region, colony)` pair. Americas sub-regions absent from the table get implicit probability 0.

---

## Fix 2 — Proper likelihood ratios in `cultural_tag_likelihoods.json` (fixes `p_l_given_r`)

### Problem
Current values like `1.8` for Yoruba are boost factors, not probabilities. Taking `log(1.8)` and adding it to a log-posterior is mathematically inconsistent — it mixes a probability score with an unnormalized weight.

### Fix
Replace with **likelihood ratios** `P(tag | region) / P(tag | baseline)`, anchored at 1.0:

| Value | Meaning |
|---|---|
| `> 1.0` | Tag is more common in this region than average |
| `= 1.0` | Tag provides no signal (default for missing entries) |
| `< 1.0` | Tag is less common in this region than average |

Example:
```json
{
  "region_bight_of_benin": {
    "yoruba": 3.5,
    "fon": 3.0,
    "candomble": 2.8,
    "mandinka": 0.2
  }
}
```

Applied in log-space as `log_score += log(ratio)`. Now valid: a ratio of 1.0 contributes 0 to the log-score (neutral), ratios > 1.0 boost, ratios < 1.0 penalize.

The existing 1.x values must be manually rescaled when populating `cultural_tag_likelihoods.json`. The relative ordering is preserved — a value that was highest before should remain highest. A reasonable starting rescale: divide each existing value by the mean value across all regions for that tag, so the average ratio across regions is 1.0.

---

## Fix 3 — Tag clustering in `tag_clusters.json` (fixes correlated tag inflation)

### Problem
Tags like "yoruba" and "candomble" both strongly indicate Bight of Benin. Treating them as independent likelihoods and multiplying them doubles the signal for that region, artificially inflating its probability.

### Fix
Define clusters of correlated tags in `tag_clusters.json`:

```json
{
  "bight_of_benin": ["yoruba", "fon", "vodou", "candomble", "ewe"],
  "central_africa":  ["kongo", "bantu", "mbundu"],
  "senegambia":      ["mandinka", "wolof", "islam"]
}
```

`bayes_model.py` groups user-selected tags by cluster. For each cluster, it applies **one likelihood per region** — the highest likelihood ratio among the user's selected tags in that cluster:

```python
# get_user_clusters returns, for each cluster, only the tags the user selected
# e.g. if user selected ["yoruba", "candomble"], returns [{"yoruba", "candomble"}] for bight_of_benin cluster
for cluster_tags in get_user_clusters(cultural_tags, tag_clusters):
    best_ratio = max(likelihoods[region].get(tag, 1.0) for tag in cluster_tags)
    log_score += math.log(best_ratio + 1e-12)
```

Tags not belonging to any cluster are applied individually, unchanged.

---

## Fix 4 — Destination-conditional prior (fixes `_load_priors()`)

### Problem
`_load_priors()` currently computes a global average across all colonies:
```sql
SELECT region_id, AVG(probability) FROM colony_region_stats GROUP BY region_id
```
This discards the most valuable signal in SlaveVoyages. Destination-specific distributions differ dramatically — Bahia is ~50% Bight of Benin; Virginia is ~40% Bight of Biafra.

### Fix
`_load_priors(colony)` queries per destination:
```sql
SELECT region_id, probability FROM colony_region_stats WHERE colony = ?
```

Fallback to global average when `colony` is `None` or has no rows in the DB.

`estimate()` already receives `colony` as a parameter — it passes it straight into `_load_priors(colony)`. No interface change.

### Pipeline audit
`pipeline_colony_stats.py` already stores per-colony rows. Before implementation, verify the stored `probability` values represent `P(region | colony)` (enslaved from region / total enslaved to colony), not a global ratio. Correct if needed.

---

## Future Work — IPF for Colony/Americas-Region De-correlation

Colony and Americas sub-region are hierarchically related (sub-region is nested inside colony). Multiplying `P(C|R) × P(M|C,R)` double-counts the geographic signal when both are derived from the same user location.

The fix is **Iterative Proportional Fitting (IPF)**: scale the joint distribution iteratively to match known marginals, eliminating the correlation. Reference: arxiv 2304.09126.

This is deferred until the four bugs above are fixed and verified. It adds ~30 lines of Python and requires calibration data for the marginals.

---

## Testing

- For each fix, add a unit test in `backend/tests/` that verifies the corrected mathematical property:
  - Fix 1: Assert each normalized `(region, colony)` row sums to 1.0
  - Fix 2: Assert `log(ratio)` for a neutral tag contributes 0 to the score
  - Fix 3: Assert selecting two tags from the same cluster produces the same score as selecting only the stronger one
  - Fix 4: Assert a known colony (e.g. "Bahia") returns a different prior than the global average, matching expected historical percentages
- Regression test: the full model run for a known input (Brazil/Bahia + yoruba tag) should return Bight of Benin as the top result before and after the fixes, with higher confidence after.
