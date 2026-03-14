# api.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from estimation_service import EstimateRequest, EstimateResponse, estimate_origins_service

app = FastAPI(title="African Ancestry Estimator (Historical)")

origins = [
    "http://localhost:3000",   # React dev server
    "http://127.0.0.1:3000",
    "http://localhost", 
    "http://127.0.0.1",
    "https://origen.marcosblandon.dev",
    "https://origen.marcosblandon.dev:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow your frontend
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods
    allow_headers=["*"],              # Allow all headers
)

# ---- Endpoint ----
@app.post("/estimate-origins", response_model=EstimateResponse)
def estimate_origins(req: EstimateRequest):
    return estimate_origins_service(req)