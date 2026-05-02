from dataclasses import dataclass
from typing import Dict, List, Optional
import math
import sqlite3

DB_PATH = "./data_pipeline/ancestry.db"
DEFAULT_P_C = 0.01  # low fallback when a region had no voyages to a colony


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


def get_p_c(region_id: str, colony: str) -> float:
    """P(C | R) — average fraction of enslaved people from region that went to colony."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """SELECT AVG(probability) FROM colony_region_stats
           WHERE region_id=? AND colony=? AND probability IS NOT NULL""",
        (region_id, colony)
    )
    row = cursor.fetchone()
    conn.close()
    if row and row[0] is not None:
        return row[0]
    return DEFAULT_P_C


def get_african_region_name(region_id: str) -> str:
    import json
    with open("data_pipeline/african_region_names.json", encoding="utf-8") as f:
        data = json.load(f)
    return data.get(region_id, region_id)


def _load_migration_weights() -> Dict[str, Dict[str, float]]:
    import json
    with open("data_pipeline/migration_weights.json", encoding="utf-8") as f:
        raw = json.load(f)
    normalized = {}
    for region_id, destinations in raw.items():
        total = sum(destinations.values())
        normalized[region_id] = {k: v / total for k, v in destinations.items()} if total > 0 else dict(destinations)
    return normalized


def _load_tag_likelihoods() -> Dict[str, Dict[str, float]]:
    import json
    with open("data_pipeline/cultural_tag_likelihoods.json", encoding="utf-8") as f:
        return json.load(f)


def _load_tag_clusters() -> Dict[str, List[str]]:
    import json
    with open("data_pipeline/tag_clusters.json", encoding="utf-8") as f:
        return json.load(f)


@dataclass
class RegionScore:
    region_id: str
    score: float
    probability: float = 0.0
    explanation: str = ""


class BayesianAncestryModel:
    """
    Bayesian ancestry model driven by historical Trans-Atlantic slave trade data.
    Priors and P(C|R) are loaded from the DB; migration and cultural weights are
    hardcoded for the MVP.
    """

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

    def _safe_get(self, d: Dict, key: str, default: float = 1.0) -> float:
        return d.get(key, default)

    def _group_tags_by_cluster(self, cultural_tags: List[str]):
        cluster_selections: Dict[str, List[str]] = {}
        ungrouped: List[str] = []
        for tag in cultural_tags:
            cluster = self._tag_to_cluster.get(tag)
            if cluster:
                cluster_selections.setdefault(cluster, []).append(tag)
            else:
                ungrouped.append(tag)
        # Reduce each cluster to the single globally-dominant tag (highest max ratio
        # across all regions) so that deduplication is region-independent.
        representatives: List[str] = []
        for tags in cluster_selections.values():
            best = max(
                tags,
                key=lambda t: max(
                    (self.tag_likelihoods.get(r, {}).get(t, 1.0) for r in self.tag_likelihoods),
                    default=1.0,
                ),
            )
            representatives.append(best)
        return representatives, ungrouped

    def estimate(
        self,
        colony: Optional[str],
        americas_region: Optional[str],
        cultural_tags: Optional[List[str]] = None
    ) -> List[RegionScore]:
        """
        colony: e.g. 'New Granada' / 'Bahia' / 'South Carolina'
        americas_region: e.g. 'Pacific Colombia', 'Bahia Coast'
        cultural_tags: e.g. ['yoruba', 'kongo', 'candomble']
        """
        cultural_tags = cultural_tags or []

        priors = self._get_priors(colony)
        scores: List[RegionScore] = []
        for region_id, prior in priors.items():
            log_score = math.log(prior + 1e-12)
            explanation_parts = [f"P(R={get_african_region_name(region_id)})={prior:.3f}"]

            # P(C | R) from DB
            if colony:
                p_c = get_p_c(region_id, colony)
                log_score += math.log(p_c + 1e-12)
                explanation_parts.append(f"P(C={colony}|R)≈{p_c:.3f}")

            # P(M | C,R)
            if americas_region:
                region_mig_probs = self.migration_weights.get(region_id, {})
                p_m = self._safe_get(region_mig_probs, americas_region, default=0.7)
                log_score += math.log(p_m + 1e-12)
                explanation_parts.append(f"P(M={americas_region}|C,R)≈{p_m:.3f}")

            # P(L | R) from cultural tags — one score per cluster, highest ratio wins
            if cultural_tags:
                region_likelihoods = self.tag_likelihoods.get(region_id, {})
                representatives, ungrouped = self._group_tags_by_cluster(cultural_tags)
                for rep_tag in representatives:
                    ratio = region_likelihoods.get(rep_tag, 1.0)
                    log_score += math.log(ratio + 1e-12)
                    explanation_parts.append(f"P(L={rep_tag}[cluster]|R)≈{ratio:.3f}")
                for tag in ungrouped:
                    ratio = region_likelihoods.get(tag, 1.0)
                    log_score += math.log(ratio + 1e-12)
                    explanation_parts.append(f"P(L={tag}|R)≈{ratio:.3f}")

            scores.append(RegionScore(
                region_id=region_id,
                score=log_score,
                explanation="; ".join(explanation_parts)
            ))

        # normalize log-scores to probabilities
        max_log = max(s.score for s in scores)
        exp_scores = [math.exp(s.score - max_log) for s in scores]
        total = sum(exp_scores)

        for s, exp_s in zip(scores, exp_scores):
            s.probability = exp_s / total if total > 0 else 0.0

        scores.sort(key=lambda s: s.probability, reverse=True)
        return scores


if __name__ == "__main__":
    model = BayesianAncestryModel()
    print("Loaded regions:", list(model.priors.keys()))
    print()

    results = model.estimate(
        colony="New Granada",
        americas_region="Pacific Colombia",
        cultural_tags=["yoruba"]
    )
    for r in results:
        print(f"{r.region_id:35s} {r.probability:.3f}  {r.explanation}")
