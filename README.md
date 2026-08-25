# Sakapinta (AI Decision Support for Stock)

> **Tiang Penyangga Keputusan Stok UMKM Indonesia**  
> *Target*: COMPFEST 18 AI Innovation Challenge — Category: Smart Commerce & Smart Logistics

---

## Overview

**Sakapinta** is an AI Decision Support System engineered for Indonesian SMEs (warungs, toko kelontong, small distributors) and 3PL warehouses. Rather than providing mere passive time-series graphs, Sakapinta computes **prescriptive, risk-weighted reorder quantities, dynamic safety stocks, and financial What-If loss projections**.

```mermaid
flowchart LR
    A["Public Baseline Retail Data\n+ Indonesian Context Overlay"] --> B["ai_pipeline/train.py\n(Offline LightGBM Training)"]
    B --> C["Export Artifact:\nsakapinta_model.joblib"]
    C --> D["FastAPI Backend\n(Static Core Inference)"]
    D --> E["Hybrid Decision Layer\n(Risk Score + Safety Stock + Financial Loss)"]
    E --> F["Actionable Next.js Dashboard"]
```

---

## Key Features & AI Architecture

1. **Offline AI Pipeline & Synthetic Data Augmentation**:
   - Automated offline training script (`ai_pipeline/train.py`) and Kaggle GPU Notebook (`ai_pipeline/train_kaggle.ipynb`).
   - Accounts for Indonesian retail temporal anomalies: Ramadan / Eid al-Fitr (+185%), Harbolnas (9.9, 10.10, 11.11, 12.12), and monthly Gajian paydays (25th to 1st).
2. **Exploratory Data Analysis (EDA) & IQR Outlier Filter**:
   - Generates EDA plots stored in `docs/eda/`:
     - `daily_sales_distribution.png`: Sales quantity distribution before & after IQR filtering.
     - `time_series_decomposition.png`: Trend, seasonality, and residual breakdown.
     - `outlier_detection_iqr.png`: Boxplot visualization of IQR bounds.
3. **Static Core Inference (Strict MVP Rule)**:
   - Synchronous FastAPI backend loads pre-trained `sakapinta_model.joblib` for instantaneous static inference (< 10 ms CPU). No model retraining occurs during API calls.
4. **Dynamic Safety Stock Calculation**:
   - $SS = \lceil 1.65 \times \sigma_{\text{forecast}} \times \sqrt{L} \rceil$ calibrated for a 95% service level standard.
5. **Multi-Factor Stockout Risk Scoring**:
   - Classifies SKUs into **High (Kritis)**, **Medium**, and **Low (Aman)** risk categories.
6. **Financial What-If Simulation**:
   - Simulates revenue at risk (Potential Lost Sales in IDR) and interactive budget constraint re-allocation.
7. **1-Click Indonesian SME Retail Sample Data**:
   - Test instantly without uploading external files via the built-in mock dataset button (`mock_data/id_retail_sample.csv`).

---

## Quick Start (Docker Compose)

Launch both Frontend and Backend with a single command:

```bash
docker-compose up --build
```

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## Offline AI Model Training & Kaggle Execution

### 1. Local Training & EDA Generation
To re-run the offline AI training pipeline, IQR outlier removal, feature engineering, and model export:
```bash
python ai_pipeline/train.py
```
*Outputs:*
- Metrics (LightGBM Multi-Quantile): RMSE 14.0265, MAE 10.9895, MAPE 20.84%, R² 0.5556 (vs XGBoost Baseline RMSE 19.5120, MAPE 28.59%)
- Visualizations: `docs/eda/outlier_detection_iqr.png`, `docs/eda/time_series_decomposition.png`, `docs/eda/model_benchmark_comparison.png`
- Model Binary: `backend/app/models/sakapinta_model.joblib` (v3.0.0)

### 2. Kaggle GPU (T4x2) Execution
Upload `ai_pipeline/train_kaggle.ipynb` to Kaggle to execute GPU benchmarking experiments comparing LightGBM, XGBoost, and N-BEATS architectures.

---

## Local Development (Without Docker)

### 1. Backend (FastAPI + Python 3.11)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (Next.js 14 App Router + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```text
sakapinta/
├── docker-compose.yml              # Single-command multi-container deployment
├── GEMINI.md                       # Hackathon & MVP rules
├── README.md                       # Getting started guide
├── ai_pipeline/
│   ├── train.py                    # Offline LightGBM training & EDA script
│   └── train_kaggle.ipynb          # Kaggle GPU (T4x2) benchmark notebook
├── mock_data/
│   └── id_retail_sample.csv        # Realistic Indonesian SME retail dataset
├── docs/
│   ├── eda/                        # Generated EDA plots (.png)
│   ├── PRD.md                      # Product Requirements Document
│   ├── Proposal.md                 # Scientific & Business Methodology
│   └── Technical_Architecture.md   # Architecture & API Specs
├── backend/
│   ├── Dockerfile                  # Python 3.11 container image
│   ├── requirements.txt            # Pinned dependencies
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # FastAPI application endpoints
│       ├── models/
│       │   └── sakapinta_model.joblib # Pre-trained LightGBM model artifact
│       └── core/
│           ├── __init__.py
│           ├── data_prep.py        # CSV parsing & Indonesian calendar features
│           ├── inference.py        # Static 14-day demand forecast engine
│           └── decision_layer.py   # Safety Stock, Risk Score & Lost Sales logic
└── frontend/
    ├── Dockerfile                  # Node.js Alpine container image
    ├── package.json                # Next.js 14, Tailwind, Recharts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.js
    └── src/
        └── app/
            ├── layout.tsx          # Root layout & SEO metadata
            ├── page.tsx            # Main interactive dashboard
            ├── globals.css         # Custom styling & glassmorphism
            └── components/
                ├── Navbar.tsx           # Header & API connection status
                ├── UploadZone.tsx       # Drag-and-drop CSV + instant sample loader
                ├── ActionableKPIs.tsx   # Executive summary metric cards
                ├── PriorityTable.tsx    # Ranked SKU decision matrix
                ├── ForecastChart.tsx    # Interactive historical + forecast chart
                └── WhatIfSimulator.tsx  # Dynamic budget & restock sensitivity tool
```
