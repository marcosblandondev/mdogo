# api.py
from pydantic import BaseModel
from typing import List, Optional
from bayes_model import BayesianAncestryModel, RegionScore, get_african_region_name

import logging
# ---- Pydantic models ----

class AncestorLocation(BaseModel):
    relation: str         # 'parent', 'grandparent', etc.
    country: str
    region: Optional[str] = None   # state/province/department
    city: Optional[str] = None
    notes: Optional[str] = None


class EstimateRequest(BaseModel):
    country: str
    city: Optional[str] = None
    region: Optional[str] = None # state/province/department
    ancestors: List[AncestorLocation] = []
    cultural_tags: List[str] = []

class RegionProbability(BaseModel):
    region_id: str
    region_name: str
    probability: float
    explanation: str

class EstimateResponse(BaseModel):
    results: List[RegionProbability]
    narrative: str

model = BayesianAncestryModel()

# ---- Helper to infer colony & americas_region from user and ancestors information (MVP heuristic) ----
def infer_colony_and_region(req: EstimateRequest):
    country = req.country.lower().strip()
    department = (req.region or "").lower().strip()

    print(f"Inferring colony and americas_region for country='{country}', department='{department}'")

    # Load mapping data
    import json
    with open("data_pipeline/country_department_colony_mapping.json") as f:
        data = json.load(f)
    mapping = data["mapping"]

    # 1) exact country + department
    for row in mapping:
        if (
            row["country"].lower() == country and
            row["department"] and
            row["department"].lower() == department
        ):
            return row["colony"], row["americas_region"]

    # 2) country-only fallback
    for row in mapping:
        if row["country"].lower() == country and row["department"] is None:
            return row["colony"], row["americas_region"]

    return None, None


def estimate_origins_service(req: EstimateRequest):
    colony, americas_region = infer_colony_and_region(req)
    print(f"Inferred colony: {colony}, americas_region: {americas_region}")

    scores: List[RegionScore] = model.estimate(
        colony=colony,
        americas_region=americas_region,
        cultural_tags=req.cultural_tags
    )

    results = [
        RegionProbability(
            region_id=s.region_id,
            region_name=get_african_region_name(s.region_id),
            probability=s.probability,
            explanation=s.explanation
        ) for s in scores
    ]

    # Simple narrative for now
    top = scores[0] if scores else None
    if top:
        narrative = (
            f"Based on your family being from {req.country}"
            f"{', region '+req.region if req.region else ''}"
            f" and the clues you provided, the model estimates that the most likely "
            f"African origin region is {get_african_region_name(top.region_id)} with probability "
            f"{top.probability:.0%}. This is influenced by historical slave trade "
            f"routes to {colony or 'your region'} and migrations towards {americas_region or 'your area'}."
        )
    else:
        narrative = "We could not compute a reliable estimate from the provided data."

    return EstimateResponse(results=results, narrative=narrative)