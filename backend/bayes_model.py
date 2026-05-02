from dataclasses import dataclass
from typing import Dict, List, Optional
import math
import sqlite3

DB_PATH = "./data_pipeline/ancestry.db"
DEFAULT_P_C = 0.01  # low fallback when a region had no voyages to a colony


def _load_priors() -> Dict[str, float]:
    """P(R) — average presence of each region across all colonies, normalized."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT region_id, AVG(probability)
        FROM colony_region_stats
        WHERE probability IS NOT NULL
        GROUP BY region_id
    """)
    rows = cursor.fetchall()
    conn.close()

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
        self.priors = _load_priors()
        self.migration_weights = _load_migration_weights()
        self.p_l_given_r = p_l_given_r  # unchanged for now

    def _safe_get(self, d: Dict, key: str, default: float = 1.0) -> float:
        return d.get(key, default)

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

        scores: List[RegionScore] = []
        for region_id, prior in self.priors.items():
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

            # P(L | R) from cultural tags
            if cultural_tags:
                region_cult_probs = self.p_l_given_r.get(region_id, {})
                for tag in cultural_tags:
                    p_l = self._safe_get(region_cult_probs, tag, default=1.0)
                    log_score += math.log(p_l + 1e-12)
                    explanation_parts.append(f"P(L={tag}|R)≈{p_l:.3f}")

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
