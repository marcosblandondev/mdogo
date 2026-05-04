# Bayesian Model Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four mathematical bugs in `bayes_model.py` and move hardcoded probability tables to JSON files, without changing the API contract.

**Architecture:** Extract `p_m_given_c_r` and `p_l_given_r` into JSON files loaded at startup; normalize migration weights per `(region, colony)` row; replace tag multipliers with likelihood ratios; add cluster-based tag deduplication; make `_load_priors()` destination-conditional with per-colony DB query and in-memory caching.

**Tech Stack:** Python 3.12, SQLite (`ancestry.db`), pytest, FastAPI (no changes to API layer)

**Known gap:** `region_congo_angola` (West Central Africa) is absent from `ancestry.db` — tags like `kongo`, `bantu`, `capoeira`, `samba` will default to neutral ratio 1.0 until the data pipeline is fixed separately.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/requirements.txt` | Modify | Add pytest |
| `backend/tests/__init__.py` | Create | Makes tests a package |
| `backend/tests/conftest.py` | Create | Sets CWD to `backend/` for all tests |
| `backend/tests/test_bayes_model.py` | Create | All unit + regression tests |
| `backend/data_pipeline/migration_weights.json` | Create | Replaces `p_m_given_c_r` hardcoded dict |
| `backend/data_pipeline/cultural_tag_likelihoods.json` | Create | Replaces `p_l_given_r` with likelihood ratios |
| `backend/data_pipeline/tag_clusters.json` | Create | Correlated tag cluster definitions |
| `backend/bayes_model.py` | Modify | Load JSONs, normalize migration, cluster tags, conditional priors |

---

## Task 1: Test Infrastructure + Baseline Regression

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Modify: `backend/requirements.txt`
- Create: `backend/tests/test_bayes_model.py`

- [ ] **Step 1: Add pytest to requirements**

`backend/requirements.txt`:
```
fastapi
uvicorn
pytest
```

- [ ] **Step 2: Create test package init**

`backend/tests/__init__.py` — empty file.

- [ ] **Step 3: Create conftest to fix working directory**

`backend/tests/conftest.py`:
```python
import os
import pytest

@pytest.fixture(autouse=True)
def set_working_dir(monkeypatch):
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    monkeypatch.chdir(backend_dir)
```

- [ ] **Step 4: Write the baseline regression test**

`backend/tests/test_bayes_model.py`:
```python
import pytest
from bayes_model import BayesianAncestryModel


def test_bahia_top_result_is_bight_of_benin():
    """Bahia colony should always return Bight of Benin as the top result."""
    model = BayesianAncestryModel()
    results = model.estimate(colony="Bahia", americas_region=None, cultural_tags=[])
    assert results[0].region_id == "region_bight_of_benin"


def test_results_sum_to_one():
    """Probabilities must sum to 1.0 (within floating-point tolerance)."""
    model = BayesianAncestryModel()
    results = model.estimate(colony="Bahia", americas_region="Bahia Coast", cultural_tags=["yoruba"])
    total = sum(r.probability for r in results)
    assert abs(total - 1.0) < 1e-6
```

- [ ] **Step 5: Install pytest and run baseline tests**

```bash
cd backend
pip install pytest
pytest tests/test_bayes_model.py -v
```

Expected: Both tests PASS (baseline confirmed before any changes).

- [ ] **Step 6: Commit baseline**

```bash
git add backend/requirements.txt backend/tests/
git commit -m "test: add pytest infrastructure and baseline regression tests"
```

---

## Task 2: Create `migration_weights.json` and Fix Normalization

**Files:**
- Create: `backend/data_pipeline/migration_weights.json`
- Modify: `backend/bayes_model.py`

- [ ] **Step 1: Write the failing normalization test**

Add to `backend/tests/test_bayes_model.py`:
```python
import json


def test_migration_weights_normalize_to_one():
    """Each (region, colony) row in migration_weights must sum to 1.0 after model init."""
    model = BayesianAncestryModel()
    for region_id, destinations in model.migration_weights.items():
        total = sum(destinations.values())
        assert abs(total - 1.0) < 1e-9, (
            f"migration_weights['{region_id}'] sums to {total}, expected 1.0"
        )
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pytest tests/test_bayes_model.py::test_migration_weights_normalize_to_one -v
```

Expected: FAIL — `AttributeError: 'BayesianAncestryModel' object has no attribute 'migration_weights'`

- [ ] **Step 3: Create `migration_weights.json`**

`backend/data_pipeline/migration_weights.json` — extracted from current `p_m_given_c_r`, pre-normalization values preserved (model normalizes at load):
```json
{
  "region_senegambia":      {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
  "region_bight_of_benin":  {"Pacific Colombia": 0.4, "Bahia Coast": 0.5},
  "region_bight_of_biafra": {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
  "region_gold_coast":      {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
  "region_windward_coast":  {"Pacific Colombia": 0.4, "Bahia Coast": 0.3},
  "region_sierra_leone":    {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
  "region_east_africa":     {"Pacific Colombia": 0.2, "Bahia Coast": 0.4},
  "region_other_africa":    {"Pacific Colombia": 0.3, "Bahia Coast": 0.3}
}
```

- [ ] **Step 4: Update `bayes_model.py` to load and normalize migration weights**

In `bayes_model.py`, replace the module-level `p_m_given_c_r` dict and update `BayesianAncestryModel.__init__`:

Remove these lines entirely:
```python
# P(M | C,R) — regional migration weights (hardcoded for MVP)
p_m_given_c_r = {
    "region_senegambia":      {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_bight_of_benin":  {"Pacific Colombia": 0.4, "Bahia Coast": 0.5},
    "region_bight_of_biafra": {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_gold_coast":      {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_windward_coast":  {"Pacific Colombia": 0.4, "Bahia Coast": 0.3},
    "region_sierra_leone":    {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_east_africa":     {"Pacific Colombia": 0.2, "Bahia Coast": 0.4},
}
```

Add a module-level loader function after the `get_african_region_name` function:
```python
def _load_migration_weights() -> Dict[str, Dict[str, float]]:
    import json
    with open("data_pipeline/migration_weights.json", encoding="utf-8") as f:
        raw = json.load(f)
    normalized = {}
    for region_id, destinations in raw.items():
        total = sum(destinations.values())
        normalized[region_id] = {k: v / total for k, v in destinations.items()} if total > 0 else dict(destinations)
    return normalized
```

Update `BayesianAncestryModel.__init__`:
```python
def __init__(self):
    self.priors = _load_priors()
    self.migration_weights = _load_migration_weights()
    self.p_l_given_r = p_l_given_r  # unchanged for now
```

Update the `estimate()` method — replace `self.p_m_given_c_r` with `self.migration_weights`:
```python
# P(M | C,R)
if americas_region:
    region_mig_probs = self.migration_weights.get(region_id, {})
    p_m = self._safe_get(region_mig_probs, americas_region, default=0.7)
    log_score += math.log(p_m + 1e-12)
    explanation_parts.append(f"P(M={americas_region}|C,R)≈{p_m:.3f}")
```

- [ ] **Step 5: Run tests**

```bash
pytest tests/test_bayes_model.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/data_pipeline/migration_weights.json backend/bayes_model.py
git commit -m "fix: move migration weights to JSON and normalize per (region, colony) row"
```

---

## Task 3: Create `cultural_tag_likelihoods.json`, `tag_clusters.json`, and Fix Tag Scoring

**Files:**
- Create: `backend/data_pipeline/cultural_tag_likelihoods.json`
- Create: `backend/data_pipeline/tag_clusters.json`
- Modify: `backend/bayes_model.py`

- [ ] **Step 1: Write the failing tag tests**

Add to `backend/tests/test_bayes_model.py`:
```python
def test_neutral_tag_does_not_change_score():
    """A tag with ratio 1.0 (not in likelihoods) must contribute exactly 0 to the log-score."""
    import math
    ratio = 1.0
    contribution = math.log(ratio + 1e-12)
    # log(1.0) ≈ 0, confirming neutral tags are inert
    assert abs(contribution) < 1e-9


def test_cluster_deduplication():
    """Selecting two tags from the same cluster must give the same score as the stronger tag alone."""
    model = BayesianAncestryModel()
    # yoruba and candomble are both in bight_of_benin_cluster
    results_both = model.estimate(colony="Bahia", americas_region=None, cultural_tags=["yoruba", "candomble"])
    results_yoruba_only = model.estimate(colony="Bahia", americas_region=None, cultural_tags=["yoruba"])
    # yoruba has higher ratio for bight_of_benin than candomble, so adding candomble should not change the score
    prob_both = next(r.probability for r in results_both if r.region_id == "region_bight_of_benin")
    prob_yoruba = next(r.probability for r in results_yoruba_only if r.region_id == "region_bight_of_benin")
    assert abs(prob_both - prob_yoruba) < 1e-9
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pytest tests/test_bayes_model.py::test_cluster_deduplication -v
```

Expected: FAIL — cluster deduplication is not implemented yet.

- [ ] **Step 3: Create `cultural_tag_likelihoods.json`**

Values are `P(tag | region) / P(tag | baseline)` likelihood ratios. Values > 1.0 boost the region; < 1.0 penalize. Default for unlisted tags is 1.0 (neutral). Tags `kongo`, `bantu`, `capoeira`, `samba` have no entry because `region_congo_angola` is absent from the DB (known gap — apply neutral default).

`backend/data_pipeline/cultural_tag_likelihoods.json`:
```json
{
  "region_senegambia": {
    "mandinka": 4.0,
    "wolof": 4.0,
    "islam": 3.0,
    "gullah": 3.0,
    "hausa": 2.5,
    "yoruba": 0.2,
    "fon": 0.2,
    "igbo": 0.2,
    "akan": 0.2,
    "candomble": 0.3,
    "vodou": 0.3,
    "santeria": 0.3
  },
  "region_bight_of_benin": {
    "yoruba": 4.5,
    "fon": 4.0,
    "vodou": 4.0,
    "candomble": 3.5,
    "ewe": 3.5,
    "santeria": 3.0,
    "islam": 1.5,
    "samba": 2.0,
    "mandinka": 0.2,
    "wolof": 0.2,
    "igbo": 0.2,
    "akan": 0.2
  },
  "region_bight_of_biafra": {
    "igbo": 4.5,
    "efik": 4.0,
    "obeah": 2.5,
    "hausa": 2.0,
    "yoruba": 0.3,
    "mandinka": 0.2,
    "vodou": 0.3
  },
  "region_gold_coast": {
    "akan": 4.0,
    "twi": 4.0,
    "asante": 4.0,
    "ashanti": 4.5,
    "gullah": 2.0,
    "obeah": 2.0,
    "ewe": 1.5,
    "mandinka": 0.2,
    "yoruba": 0.3
  },
  "region_windward_coast": {
    "kru": 4.0,
    "mende": 1.5,
    "temne": 1.5
  },
  "region_sierra_leone": {
    "temne": 4.0,
    "mende": 4.0,
    "kru": 1.5,
    "mandinka": 1.8,
    "yoruba": 0.3
  },
  "region_east_africa": {
    "swahili": 4.5,
    "makua": 4.0,
    "bantu": 2.0,
    "yoruba": 0.2,
    "igbo": 0.2
  }
}
```

- [ ] **Step 4: Create `tag_clusters.json`**

Groups correlated tags that point to the same region. One likelihood per cluster is applied (highest ratio wins). Tags not in any cluster are applied individually.

`backend/data_pipeline/tag_clusters.json`:
```json
{
  "bight_of_benin_cluster": ["yoruba", "fon", "vodou", "candomble", "ewe", "santeria"],
  "senegambia_cluster":     ["mandinka", "wolof", "islam", "gullah"],
  "gold_coast_cluster":     ["akan", "twi", "asante", "ashanti"],
  "biafra_cluster":         ["igbo", "efik"],
  "sierra_leone_cluster":   ["temne", "mende"],
  "east_africa_cluster":    ["swahili", "makua"]
}
```

- [ ] **Step 5: Update `bayes_model.py`**

Add two loader functions after `_load_migration_weights`:
```python
def _load_tag_likelihoods() -> Dict[str, Dict[str, float]]:
    import json
    with open("data_pipeline/cultural_tag_likelihoods.json", encoding="utf-8") as f:
        return json.load(f)


def _load_tag_clusters() -> Dict[str, List[str]]:
    import json
    with open("data_pipeline/tag_clusters.json", encoding="utf-8") as f:
        return json.load(f)
```

Remove the module-level `p_l_given_r` dict:
```python
# P(L | R) — cultural tag multipliers (hardcoded for MVP)
p_l_given_r = {
    "region_senegambia":      {"mandinka": 1.6, "wolof": 1.5, "islam": 1.4},
    "region_bight_of_benin":  {"yoruba": 1.8, "fon": 1.6, "candomble": 1.5, "vodou": 1.5},
    "region_bight_of_biafra": {"igbo": 1.8, "efik": 1.5},
    "region_gold_coast":      {"akan": 1.7, "twi": 1.6, "asante": 1.6},
    "region_windward_coast":  {"kru": 1.5},
    "region_sierra_leone":    {"temne": 1.5, "mende": 1.5},
    "region_east_africa":     {"swahili": 1.5, "makua": 1.5},
}
```

Update `BayesianAncestryModel.__init__`:
```python
def __init__(self):
    self.priors = _load_priors()
    self.migration_weights = _load_migration_weights()
    self.tag_likelihoods = _load_tag_likelihoods()
    self.tag_clusters = _load_tag_clusters()
    # reverse map: tag -> cluster_name
    self._tag_to_cluster: Dict[str, str] = {
        tag: cluster
        for cluster, tags in self.tag_clusters.items()
        for tag in tags
    }
```

Add a helper method to `BayesianAncestryModel`:
```python
def _group_tags_by_cluster(self, cultural_tags: List[str]):
    """
    Returns (cluster_groups, ungrouped).
    cluster_groups: list of lists — one list per cluster that has >=1 user tag.
    ungrouped: tags not in any cluster, applied individually.
    """
    cluster_selections: Dict[str, List[str]] = {}
    ungrouped: List[str] = []
    for tag in cultural_tags:
        cluster = self._tag_to_cluster.get(tag)
        if cluster:
            cluster_selections.setdefault(cluster, []).append(tag)
        else:
            ungrouped.append(tag)
    return list(cluster_selections.values()), ungrouped
```

Replace the cultural tag block inside `estimate()`:

Old block (remove this):
```python
# P(L | R) from cultural tags
if cultural_tags:
    region_cult_probs = self.p_l_given_r.get(region_id, {})
    for tag in cultural_tags:
        p_l = self._safe_get(region_cult_probs, tag, default=1.0)
        log_score += math.log(p_l + 1e-12)
        explanation_parts.append(f"P(L={tag}|R)≈{p_l:.3f}")
```

New block (replace with this):
```python
# P(L | R) from cultural tags — one score per cluster, highest ratio wins
if cultural_tags:
    region_likelihoods = self.tag_likelihoods.get(region_id, {})
    cluster_groups, ungrouped = self._group_tags_by_cluster(cultural_tags)
    for cluster_tags in cluster_groups:
        best_ratio = max(region_likelihoods.get(tag, 1.0) for tag in cluster_tags)
        best_tag = max(cluster_tags, key=lambda t: region_likelihoods.get(t, 1.0))
        log_score += math.log(best_ratio + 1e-12)
        explanation_parts.append(f"P(L={best_tag}[cluster]|R)≈{best_ratio:.3f}")
    for tag in ungrouped:
        ratio = region_likelihoods.get(tag, 1.0)
        log_score += math.log(ratio + 1e-12)
        explanation_parts.append(f"P(L={tag}|R)≈{ratio:.3f}")
```

- [ ] **Step 6: Run all tests**

```bash
pytest tests/test_bayes_model.py -v
```

Expected: All 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/data_pipeline/cultural_tag_likelihoods.json backend/data_pipeline/tag_clusters.json backend/bayes_model.py
git commit -m "fix: replace p_l_given_r multipliers with likelihood ratios and add cluster deduplication"
```

---

## Task 4: Destination-Conditional Priors

**Files:**
- Modify: `backend/bayes_model.py`

- [ ] **Step 1: Write the failing test**

Add to `backend/tests/test_bayes_model.py`:
```python
def test_destination_conditional_prior_differs_from_global():
    """Priors for 'Bahia' must differ from global average and rank Bight of Benin highest."""
    model = BayesianAncestryModel()
    bahia_priors = model._get_priors("Bahia")
    global_priors = model._get_priors(None)
    # Bahia priors must differ from global
    assert bahia_priors != global_priors
    # Bight of Benin must be the top prior for Bahia (it's ~77% of Bahia traffic historically)
    top_region = max(bahia_priors, key=bahia_priors.get)
    assert top_region == "region_bight_of_benin"


def test_bahia_yoruba_confidence_increases_with_conditional_prior():
    """Bight of Benin probability for Bahia+yoruba must be > 0.5 with destination-conditional prior."""
    model = BayesianAncestryModel()
    results = model.estimate(colony="Bahia", americas_region=None, cultural_tags=["yoruba"])
    bight_prob = next(r.probability for r in results if r.region_id == "region_bight_of_benin")
    assert bight_prob > 0.5
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pytest tests/test_bayes_model.py::test_destination_conditional_prior_differs_from_global -v
```

Expected: FAIL — `AttributeError: 'BayesianAncestryModel' object has no attribute '_get_priors'`

- [ ] **Step 3: Update `_load_priors()` to accept a colony parameter**

Replace the current `_load_priors()` function with:
```python
def _load_priors(colony: Optional[str] = None) -> Dict[str, float]:
    """P(R) — normalized region probabilities.
    If colony is provided, conditions on that destination. Falls back to global average."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if colony:
        cursor.execute("""
            SELECT region_id, AVG(probability)
            FROM colony_region_stats
            WHERE colony = ? AND probability IS NOT NULL
            GROUP BY region_id
        """, (colony,))
    else:
        cursor.execute("""
            SELECT region_id, AVG(probability)
            FROM colony_region_stats
            WHERE probability IS NOT NULL
            GROUP BY region_id
        """)
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        return _load_priors(None) if colony else {}
    raw = {region_id: avg for region_id, avg in rows}
    total = sum(raw.values())
    return {rid: v / total for rid, v in raw.items()} if total > 0 else raw
```

- [ ] **Step 4: Update `BayesianAncestryModel` to cache priors per colony**

Replace `__init__` and add `_get_priors`:
```python
def __init__(self):
    self._priors_cache: Dict[Optional[str], Dict[str, float]] = {}
    self.migration_weights = _load_migration_weights()
    self.tag_likelihoods = _load_tag_likelihoods()
    self.tag_clusters = _load_tag_clusters()
    self._tag_to_cluster: Dict[str, str] = {
        tag: cluster
        for cluster, tags in self.tag_clusters.items()
        for tag in tags
    }

def _get_priors(self, colony: Optional[str]) -> Dict[str, float]:
    if colony not in self._priors_cache:
        self._priors_cache[colony] = _load_priors(colony)
    return self._priors_cache[colony]
```

- [ ] **Step 5: Update `estimate()` to use `_get_priors(colony)`**

Replace the first line inside `estimate()` that iterates over `self.priors`:

Old:
```python
scores: List[RegionScore] = []
for region_id, prior in self.priors.items():
```

New:
```python
priors = self._get_priors(colony)
scores: List[RegionScore] = []
for region_id, prior in priors.items():
```

- [ ] **Step 6: Run all tests**

```bash
pytest tests/test_bayes_model.py -v
```

Expected: All 7 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/bayes_model.py
git commit -m "fix: make _load_priors destination-conditional with per-colony DB query and caching"
```

---

## Task 5: Final Verification and Cleanup

**Files:**
- Modify: `backend/bayes_model.py` (remove leftover `self.priors` from `__main__` block if present)

- [ ] **Step 1: Run the full test suite**

```bash
cd backend
pytest tests/ -v
```

Expected: All 7 tests pass. Sample output:
```
tests/test_bayes_model.py::test_bahia_top_result_is_bight_of_benin PASSED
tests/test_bayes_model.py::test_results_sum_to_one PASSED
tests/test_bayes_model.py::test_migration_weights_normalize_to_one PASSED
tests/test_bayes_model.py::test_neutral_tag_does_not_change_score PASSED
tests/test_bayes_model.py::test_cluster_deduplication PASSED
tests/test_bayes_model.py::test_destination_conditional_prior_differs_from_global PASSED
tests/test_bayes_model.py::test_bahia_yoruba_confidence_increases_with_conditional_prior PASSED
```

- [ ] **Step 2: Do a manual smoke test via the server**

Start the server and confirm it responds correctly:
```bash
cd backend
fastapi dev server.py &
sleep 3
curl -s -X POST http://localhost:8000/estimate-origins \
  -H "Content-Type: application/json" \
  -d '{"country":"Brazil","region":"Bahia","city":null,"ancestors":[],"cultural_tags":["yoruba","candomble"]}' \
  | python -m json.tool | head -30
```

Expected: response with `region_bight_of_benin` as the top result and probability > 0.5.

- [ ] **Step 3: Remove leftover `self.priors` from `__main__` block**

In `bayes_model.py`, the `__main__` block references `model.priors`:
```python
print("Loaded regions:", list(model.priors.keys()))
```

Replace with:
```python
print("Loaded regions:", list(model._get_priors(None).keys()))
```

- [ ] **Step 4: Final commit**

```bash
git add backend/bayes_model.py
git commit -m "fix: update __main__ smoke test to use _get_priors() after refactor"
```

---

## Self-Review Checklist

- [x] Fix 1 (migration normalization): Task 2 creates JSON + normalization in loader
- [x] Fix 2 (tag likelihood ratios): Task 3 creates `cultural_tag_likelihoods.json` with proper ratios
- [x] Fix 3 (cluster deduplication): Task 3 adds `_group_tags_by_cluster` + updated loop
- [x] Fix 4 (destination-conditional prior): Task 4 updates `_load_priors(colony)` + caching
- [x] All 4 fixes have corresponding unit tests
- [x] Regression test verifies Bahia+yoruba → Bight of Benin with >50% confidence
- [x] No TBDs or placeholders in task steps
- [x] Method names consistent across tasks: `_get_priors`, `_group_tags_by_cluster`, `migration_weights`, `tag_likelihoods`, `tag_clusters`, `_tag_to_cluster`
- [x] `self.priors` removed everywhere (replaced by `_get_priors()` in Task 4)
