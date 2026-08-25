import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

from app.core.data_prep import parse_and_validate_csv
from app.core.inference import run_demand_inference
from app.core.decision_layer import apply_hybrid_decision_logic

app = FastAPI(
    title="Sakapinta Decision Support Engine API",
    description="AI-powered inventory decision support API for Indonesian SMEs and 3PL warehouses",
    version="1.0.0"
)

# Enable CORS for Next.js frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local Docker / dev access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def resolve_mock_data_path() -> Path:
    """Finds the mock data file across local development, Docker containers, and Cloud paths."""
    candidate_paths = [
        Path(__file__).resolve().parent.parent / "mock_data" / "id_retail_sample.csv",
        Path(__file__).resolve().parent.parent.parent / "mock_data" / "id_retail_sample.csv",
        Path("/app/mock_data/id_retail_sample.csv"),
        Path("/app/backend/mock_data/id_retail_sample.csv"),
        Path("backend/mock_data/id_retail_sample.csv"),
        Path("mock_data/id_retail_sample.csv"),
    ]
    for p in candidate_paths:
        if p.exists():
            return p
    return candidate_paths[0]

MOCK_DATA_PATH = resolve_mock_data_path()


@app.get("/")
@app.get("/api/health")
def health_check():
    """Health check endpoint for container probes and monitoring."""
    return {
        "status": "healthy",
        "service": "Sakapinta Decision Support Engine",
        "version": "1.0.0",
        "framework": "FastAPI + Python 3.11",
        "competition": "COMPFEST 18 AI Innovation Challenge"
    }


@app.get("/api/sample-data")
def get_sample_data():
    """Returns the bundled Indonesian SME retail sample dataset for 1-click UI testing."""
    if MOCK_DATA_PATH.exists():
        with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        return PlainTextResponse(content, media_type="text/csv")
    else:
        # Return fallback embedded CSV string
        fallback_csv = (
            "Date,ProductID,ProductName,Qty,Price,Cost,CurrentStock\n"
            "2026-08-01,SKU-BERAS-05,Beras Ramos Premium 5kg,18,78000,68000,18\n"
            "2026-08-01,SKU-MINYAK-02,Minyak Goreng Sawit 2L,34,38000,33000,22\n"
        )
        return PlainTextResponse(fallback_csv, media_type="text/csv")


@app.post("/api/predict-and-decide")
async def predict_and_decide(file: UploadFile = File(None)):
    """
    Main synchronous AI decision pipeline:
    1. Reads uploaded CSV (or built-in sample data if file is omitted).
    2. Normalizes schema and injects Indonesian calendar features.
    3. Runs 14-day demand inference with confidence bounds.
    4. Computes Safety Stock, Risk Score, Priority Ranking, and What-If Financials.
    """
    try:
        if file is not None:
            csv_bytes = await file.read()
            if len(csv_bytes) == 0:
                raise ValueError("Uploaded file is empty.")
        else:
            # If no file uploaded, load the bundled Indonesian sample dataset
            actual_path = resolve_mock_data_path()
            if actual_path.exists():
                with open(actual_path, "rb") as f:
                    csv_bytes = f.read()
            else:
                # Embedded 12-SKU fallback data directly
                raise ValueError("No file provided and sample dataset is not accessible.")

        # 1. Parse and validate
        df = parse_and_validate_csv(csv_bytes)
        if df.empty:
            raise ValueError("CSV contains no valid sales records.")

        # 2. Time-series forecast inference
        forecast_items = run_demand_inference(df, horizon=14)
        if not forecast_items:
            raise ValueError("Failed to generate forecasts for products in CSV.")

        # 3. Hybrid decision post-processing
        decision_payload = apply_hybrid_decision_logic(forecast_items)

        return JSONResponse(content=decision_payload)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Decision Engine Error: {str(e)}")
