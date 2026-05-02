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
