# api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from bayes_model import BayesianAncestryModel, RegionScore

app = FastAPI(title="African Ancestry Estimator (Historical)")

origins = [
    "http://localhost:3000",   # React dev server
    "http://127.0.0.1:3000",
    "http://localhost", 
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow your frontend
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)

# ---- Pydantic models ----

class AncestorLocation(BaseModel):
    relation: str         # 'parent', 'grandparent', etc.
    country: str
    region: Optional[str] = None   # state/province/department
    city: Optional[str] = None
    notes: Optional[str] = None

# class EstimateRequest(BaseModel):
#     country_of_birth: str
#     americas_region: Optional[str] = None
#     colony_guess: Optional[str] = None
#     ancestors: List[AncestorLocation] = []
#     cultural_tags: List[str] = []

class EstimateRequest(BaseModel):
    country: str
    city: Optional[str] = None
    region: Optional[str] = None
    ancestors: List[AncestorLocation] = []
    cultural_tags: List[str] = []

class RegionProbability(BaseModel):
    region_id: str
    probability: float
    explanation: str

class EstimateResponse(BaseModel):
    results: List[RegionProbability]
    narrative: str

# ---- Placeholders for model loading (you'd load from DB) ----
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
    "region_congo_angola": {"Pacific Colombia": 0.7, "Bahia Coast": 0.6},
    "region_gold_coast": {"Pacific Colombia": 0.3, "Bahia Coast": 0.3},
    "region_bight_of_benin": {"Pacific Colombia": 0.4, "Bahia Coast": 0.3}
}

p_l_given_r = {
    "region_congo_angola": {"kongo": 1.5},
    "region_gold_coast": {"yoruba": 1.8},
    "region_bight_of_benin": {"fon": 1.6}
}

model = BayesianAncestryModel(priors, p_c_given_r, p_m_given_c_r, p_l_given_r)

# ---- Helper to infer colony & americas_region from user and ancestors information (MVP heuristic) ----
def infer_colony_and_region(req: EstimateRequest):
    # For MVP, just use americas_region if user passes it
    # TODO: map country, region, city, ancestors to colony + americas_region
    colony = req.region
    americas_region = req.country

    # You can improve later by mapping countries/regions to colony + americas_region
    # e.g., if country_of_birth == "Colombia" and region == "Valle del Cauca" -> "Pacific Colombia"
    return colony, americas_region

# ---- Endpoint ----
@app.post("/estimate-origins", response_model=EstimateResponse)
def estimate_origins(req: EstimateRequest):
    colony, americas_region = infer_colony_and_region(req)

    scores: List[RegionScore] = model.estimate(
        colony=colony,
        americas_region=americas_region,
        cultural_tags=req.cultural_tags
    )

    results = [
        RegionProbability(
            region_id=s.region_id,
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
            f"African origin region is {top.region_id} with probability "
            f"{top.probability:.0%}. This is influenced by historical slave trade "
            f"routes to {colony or 'your region'} and migrations towards {americas_region or 'your area'}."
        )
    else:
        narrative = "We could not compute a reliable estimate from the provided data."

    return EstimateResponse(results=results, narrative=narrative)