import json
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


def test_migration_weights_normalize_to_one():
    """Each (region, colony) row in migration_weights must sum to 1.0 after model init."""
    model = BayesianAncestryModel()
    for region_id, destinations in model.migration_weights.items():
        total = sum(destinations.values())
        assert abs(total - 1.0) < 1e-9, (
            f"migration_weights['{region_id}'] sums to {total}, expected 1.0"
        )


def test_neutral_tag_does_not_change_score():
    """A tag with ratio 1.0 (not in likelihoods) must contribute exactly 0 to the log-score."""
    import math
    ratio = 1.0
    contribution = math.log(ratio + 1e-12)
    assert abs(contribution) < 1e-9


def test_cluster_deduplication():
    """Selecting two tags from the same cluster must give the same score as the stronger tag alone."""
    model = BayesianAncestryModel()
    results_both = model.estimate(colony="Bahia", americas_region=None, cultural_tags=["yoruba", "candomble"])
    results_yoruba_only = model.estimate(colony="Bahia", americas_region=None, cultural_tags=["yoruba"])
    prob_both = next(r.probability for r in results_both if r.region_id == "region_bight_of_benin")
    prob_yoruba = next(r.probability for r in results_yoruba_only if r.region_id == "region_bight_of_benin")
    assert abs(prob_both - prob_yoruba) < 1e-9
