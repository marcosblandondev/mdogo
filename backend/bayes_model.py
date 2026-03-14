from dataclasses import dataclass
from typing import Dict, List, Optional
import math

import sqlite3


# ---- Placeholders for model loading (you'd load from DB) ----

DEFAULT_PROBABILITY = 0.5

# P(R)
# Baseline probability of each African region overall (before considering the user’s clues).
# we can calculate this from the data of how many people are from each region where taken 
# as slaves compared to the population at the given time
priors = {
    "region_congo_angola": 0.4,
    "region_gold_coast": 0.3,
    "region_bight_of_benin": 0.3
}

# P(C | R)
# For each African region, how likely it is that people from that region arrived in a given colony.
# TODO: replace this with data from DB, sum up probability when more than one entry found
p_c_given_r = {
    "region_congo_angola": {"New Granada": 0.6, "Bahia": 0.7},
    "region_gold_coast": {"New Granada": 0.2, "Bahia": 0.1},
    "region_bight_of_benin": {"New Granada": 0.2, "Bahia": 0.2}
}

def get_p_c(region_id: str, colony: str) -> float:
    conn = sqlite3.connect("./data_pipeline/ancestry.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT sum(probability) as probability FROM colony_region_stats WHERE region_id=? AND colony=?",
        (region_id, colony)
    )
    row = cursor.fetchone()
    if row:
        return row[0]
    return DEFAULT_PROBABILITY  # default fallback

# P(M | C,R)
# For each African region, a weight for the user's Americas region (e.g. “Pacific Colombia”, “Bahia Coast”).
p_m_given_c_r = {
    "region_congo_angola": {"Pacific Colombia": 0.7, "Bahia Coast": 0.6},
    "region_gold_coast": {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_bight_of_benin": {"Pacific Colombia": 0.4, "Bahia Coast": 0.3}
}

# P(L | R)
# These are multipliers (not necessarily probabilities) that boost a region when the user provides cultural tags.
p_l_given_r = {
    "region_congo_angola": {"kongo": 1.5},
    "region_gold_coast": {"yoruba": 1.8},
    "region_bight_of_benin": {"fon": 1.6}
}

def get_african_region_name(region_id: str) -> str:
    import json
    with open("data_pipeline/african_region_names.json") as f:
        data = json.load(f)
    return data.get(region_id, "Unknown Region")

@dataclass
class RegionScore:
    region_id: str
    score: float
    probability: float = 0.0
    explanation: str = ""

class BayesianAncestryModel:
    """
    Simple Bayesian-style model that combines multiple likelihood
    components into a relative score for each African region.
    """

    def __init__(self,):
        self.priors = priors
        self.p_c_given_r = p_c_given_r
        self.p_m_given_c_r = p_m_given_c_r
        self.p_l_given_r = p_l_given_r

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
        americas_region: more local region, e.g. 'Pacific Colombia', 'Bahia Coast'
        cultural_tags: list of small clues, e.g. ['yoruba', 'kongo', 'candomble']
        """
        cultural_tags = cultural_tags or []

        scores: List[RegionScore] = []
        for region_id, prior in self.priors.items():
            log_score = math.log(prior + 1e-12)  # work in log-space to avoid underflow
            explanation_parts = [f"P(R={get_african_region_name(region_id)})={prior:.3f}"]

            # P(C | R)
            if colony:
                #colony_probs = self.p_c_given_r.get(region_id, {})
                #p_c = self._safe_get(colony_probs, colony, default=0.5)
                p_c = get_p_c(region_id, colony)
                log_score += math.log(p_c + 1e-12)
                explanation_parts.append(f"P(C={colony}|R)≈{p_c:.3f}")

            # P(M | C,R) simplified to americas_region weight
            if americas_region:
                region_mig_probs = self.p_m_given_c_r.get(region_id, {})
                p_m = self._safe_get(region_mig_probs, americas_region, default=0.7)
                log_score += math.log(p_m + 1e-12)
                explanation_parts.append(f"P(M={americas_region}|C,R)≈{p_m:.3f}")

            # P(L | R) from cultural tags
            if cultural_tags:
                region_cult_probs = self.p_l_given_r.get(region_id, {})
                for tag in cultural_tags:
                    p_l = self._safe_get(region_cult_probs, tag, default=1.0)
                    log_score += math.log(p_l + 1e-12)
                    explanation_parts.append(f"P(L includes {tag}|R)≈{p_l:.3f}")

            scores.append(
                RegionScore(
                    region_id=region_id,
                    score=log_score,
                    explanation="; ".join(explanation_parts)
                )
            )

        # normalize log-scores into probabilities
        max_log = max(s.score for s in scores)
        exp_scores = [math.exp(s.score - max_log) for s in scores]
        total = sum(exp_scores)

        for s, exp_s in zip(scores, exp_scores):
            s.probability = exp_s / total if total > 0 else 0.0

        # sort descending by probability
        scores.sort(key=lambda s: s.probability, reverse=True)
        return scores


if __name__ == "__main__":
    # Very small dummy example
    priors = {
        "region_congo_angola": 0.4,
        "region_gold_coast": 0.3,
        "region_bight_of_benin": 0.3
    }

    p_c_given_r = {
        "region_congo_angola": {"New Granada": 0.6, "Bahia": 0.7},
        "region_gold_coast": {"New Granada": 0.2, "Bahia": 0.1},
        "region_bight_of_benin": {"New Granada": 0.2, "Bahia": 0.2}
    }

    p_m_given_c_r = {
        "region_congo_angola": {"Pacific Colombia": 0.7},
        "region_gold_coast": {"Pacific Colombia": 0.3},
        "region_bight_of_benin": {"Pacific Colombia": 0.4}
    }

    p_l_given_r = {
        "region_congo_angola": {"kongo": 1.5, "bantu": 1.3},
        "region_gold_coast": {"yoruba": 1.8, "akan": 1.5},
        "region_bight_of_benin": {"fon": 1.6}
    }

    model = BayesianAncestryModel(priors, p_c_given_r, p_m_given_c_r, p_l_given_r)
    results = model.estimate(
        colony="New Granada",
        americas_region="Pacific Colombia",
        cultural_tags=["kongo"]
    )

    for r in results:
        print(r.region_id, f"{r.probability:.3f}", "->", r.explanation)
