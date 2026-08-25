import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.data_prep import calculate_indonesian_seasonality_index

HORIZON_DAYS = 14

MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "sakapinta_model.joblib")
)

_MODEL_ARTIFACT: Optional[Dict[str, Any]] = None


def load_static_model_artifact() -> Optional[Dict[str, Any]]:
    """
    Loads pre-trained Multi-Quantile LightGBM model artifact statically from disk.
    Follows MVP Rule: Zero model retraining or weight updates during API execution.
    """
    global _MODEL_ARTIFACT
    if _MODEL_ARTIFACT is not None:
        return _MODEL_ARTIFACT

    if os.path.exists(MODEL_PATH):
        try:
            _MODEL_ARTIFACT = joblib.load(MODEL_PATH)
            print(f"[Core Inference] Static AI model artifact loaded successfully from {MODEL_PATH}")
            return _MODEL_ARTIFACT
        except Exception as e:
            print(f"[Core Inference] Failed to load model artifact ({e}). Fallback to trend baseline.")
            return None
    else:
        print(f"[Core Inference] Model file not found at {MODEL_PATH}. Operating in baseline mode.")
        return None


def calculate_croston_forecast(qty_series: pd.Series, alpha: float = 0.15) -> float:
    """
    Croston's Method for intermittent (zero-inflated) retail demand:
    Decomposes demand into non-zero quantity (z) and inter-arrival interval (p).
    Expected rate = z / p.
    """
    non_zeros = qty_series[qty_series > 0]
    if len(non_zeros) == 0:
        return 0.5
    
    # Compute demand intervals
    indices = qty_series[qty_series > 0].index.tolist()
    if len(indices) > 1:
        intervals = [indices[i] - indices[i-1] for i in range(1, len(indices))]
        avg_interval = max(1.0, float(np.mean(intervals)))
    else:
        avg_interval = max(1.0, float(len(qty_series) / len(non_zeros)))
        
    avg_non_zero_qty = float(np.mean(non_zeros))
    croston_rate = avg_non_zero_qty / avg_interval
    return max(0.5, croston_rate)


def run_demand_inference(df: pd.DataFrame, horizon: int = HORIZON_DAYS) -> List[Dict[str, Any]]:
    """
    Executes industrial demand forecasting pipeline:
    1. Multi-Quantile LightGBM for regular and high-velocity SKUs.
    2. Croston's Two-Stage Decomposition for intermittent / slow-moving items (zero-sales > 35%).
    3. Hierarchical Bayesian Empirical Prior for cold-start items (< 7 days history).
    """
    artifact = load_static_model_artifact()
    
    model_p50 = artifact.get("model_p50") if artifact else artifact.get("model") if artifact else None
    model_p10 = artifact.get("model_p10") if artifact else None
    model_p90 = artifact.get("model_p90") if artifact else None
    
    feature_names = artifact.get("feature_names") if artifact else []
    sku_to_code = artifact.get("sku_to_code", {}) if artifact else {}
    use_log1p = artifact.get("use_log1p", False) if artifact else False
    metrics = artifact.get("metrics") if artifact else {}
    residual_std = metrics.get("residual_std", 3.0)

    # Compute global baseline for hierarchical empirical Bayes prior
    global_mean_qty = float(df['qty'].mean()) if len(df) > 0 else 20.0
    global_std_qty = float(df['qty'].std()) if len(df) > 0 else 5.0

    forecast_results = []
    unique_products = df['product_id'].unique()

    for pid in unique_products:
        prod_df = df[df['product_id'] == pid].sort_values(by='date')
        if prod_df.empty:
            continue

        prod_name = prod_df['product_name'].iloc[-1]
        unit_price = float(prod_df['price'].iloc[-1])
        unit_cost = float(prod_df['cost'].iloc[-1])
        current_stock = float(prod_df['current_stock'].iloc[-1])

        # Historical series
        hist_dates = prod_df['date'].dt.strftime('%Y-%m-%d').tolist()
        hist_qtys = prod_df['qty'].tolist()

        historical_points = [
            {"date": d, "qty": round(float(q), 1)}
            for d, q in zip(hist_dates[-30:], hist_qtys[-30:])
        ]

        recent_qty_series = pd.Series(hist_qtys).reset_index(drop=True)
        history_len = len(recent_qty_series)
        zero_ratio = float((recent_qty_series == 0).sum()) / max(1, history_len)

        # Classify Demand Profile
        if history_len < 7:
            demand_profile = "Cold-Start (Bayesian Prior)"
        elif zero_ratio >= 0.35:
            demand_profile = "Intermittent (Croston Hurdle)"
        else:
            demand_profile = "Fast-Moving Tabular LightGBM"

        # Baseline Statistics with Empirical Bayes shrinkage for short history
        if history_len < 7:
            # Empirical Bayes weighting: w = n / 7
            w = history_len / 7.0
            raw_sku_mean = recent_qty_series.mean() if history_len > 0 else global_mean_qty
            baseline_mean = (w * raw_sku_mean) + ((1.0 - w) * global_mean_qty)
            baseline_std = max(2.0, (w * recent_qty_series.std()) + ((1.0 - w) * global_std_qty) if history_len > 1 else global_std_qty)
        else:
            baseline_mean = recent_qty_series.tail(14).mean()
            baseline_std = recent_qty_series.tail(14).std()
            if pd.isna(baseline_std) or baseline_std <= 0:
                baseline_std = max(1.5, baseline_mean * 0.18)

        # Multi-Lag & Rolling Features
        lag_7_val = float(recent_qty_series.iloc[-7]) if history_len >= 7 else float(baseline_mean)
        lag_14_val = float(recent_qty_series.iloc[-14]) if history_len >= 14 else float(baseline_mean)
        lag_21_val = float(recent_qty_series.iloc[-21]) if history_len >= 21 else float(baseline_mean)
        lag_28_val = float(recent_qty_series.iloc[-28]) if history_len >= 28 else float(baseline_mean)
        
        rolling_mean_7_val = float(recent_qty_series.tail(7).mean()) if history_len >= 7 else float(baseline_mean)
        rolling_std_7_val = float(recent_qty_series.tail(7).std()) if history_len >= 7 else float(baseline_std)
        if pd.isna(rolling_std_7_val): rolling_std_7_val = float(baseline_std)
            
        rolling_mean_14_val = float(recent_qty_series.tail(14).mean()) if history_len >= 14 else float(baseline_mean)
        rolling_max_14_val = float(recent_qty_series.tail(14).max()) if history_len >= 14 else float(baseline_mean * 1.5)

        ewm_7_val = float(recent_qty_series.ewm(span=7).mean().iloc[-1]) if history_len > 0 else float(baseline_mean)
        ewm_14_val = float(recent_qty_series.ewm(span=14).mean().iloc[-1]) if history_len > 0 else float(baseline_mean)

        product_cat_code = int(sku_to_code.get(pid, 0))

        # Intermittent Croston Rate if applicable
        croston_rate = calculate_croston_forecast(recent_qty_series) if demand_profile == "Intermittent (Croston Hurdle)" else None

        last_date = prod_df['date'].max()
        if pd.isna(last_date):
            last_date = datetime.now()

        daily_predictions = []
        forecast_qtys = []

        for step in range(1, horizon + 1):
            future_date = last_date + timedelta(days=step)
            day = future_date.day
            month = future_date.month
            dow = future_date.weekday()
            day_of_year = future_date.timetuple().tm_yday
            is_weekend = 1 if dow >= 5 else 0

            # Fourier Harmonics
            fourier_sin_annual = np.sin(2 * np.pi * day_of_year / 365.25)
            fourier_cos_annual = np.cos(2 * np.pi * day_of_year / 365.25)
            fourier_sin_monthly = np.sin(2 * np.pi * day / 30.5)
            fourier_cos_monthly = np.cos(2 * np.pi * day / 30.5)

            # Indonesian Local Features
            is_payday = 1 if (day >= 25 or day <= 1) else 0
            is_harbolnas = 1 if (month, day) in [(9, 9), (10, 10), (11, 11), (12, 12)] else 0
            is_ramadan_eid = 1 if (month == 3 and day >= 10) or (month == 4 and day <= 15) else 0

            indo_season_mult, event_desc = calculate_indonesian_seasonality_index(future_date)

            if demand_profile == "Intermittent (Croston Hurdle)":
                # Apply Croston Rate modulated by calendar surge
                point_pred = croston_rate * indo_season_mult
                noise_band = max(1.5, baseline_std * 0.8)
                lower_bound = max(0.0, point_pred - 1.0 * noise_band)
                upper_bound = point_pred + 1.5 * noise_band
            elif model_p50 is not None and len(feature_names) > 0 and demand_profile != "Cold-Start (Bayesian Prior)":
                feat_dict = {
                    "product_cat": product_cat_code,
                    "day": day,
                    "month": month,
                    "day_of_week": dow,
                    "is_weekend": is_weekend,
                    "fourier_sin_annual": fourier_sin_annual,
                    "fourier_cos_annual": fourier_cos_annual,
                    "fourier_sin_monthly": fourier_sin_monthly,
                    "fourier_cos_monthly": fourier_cos_monthly,
                    "is_payday": is_payday,
                    "is_harbolnas": is_harbolnas,
                    "is_ramadan_eid": is_ramadan_eid,
                    "price": unit_price,
                    "lag_7": lag_7_val,
                    "lag_14": lag_14_val,
                    "lag_21": lag_21_val,
                    "lag_28": lag_28_val,
                    "rolling_mean_7": rolling_mean_7_val,
                    "rolling_std_7": rolling_std_7_val,
                    "rolling_mean_14": rolling_mean_14_val,
                    "rolling_max_14": rolling_max_14_val,
                    "ewm_7": ewm_7_val,
                    "ewm_14": ewm_14_val
                }
                
                feat_df = pd.DataFrame([feat_dict])
                valid_cols = [c for c in feature_names if c in feat_df.columns]
                feat_df = feat_df[valid_cols]
                
                raw_pred_p50 = float(model_p50.predict(feat_df)[0])
                point_pred = np.expm1(raw_pred_p50) if use_log1p else raw_pred_p50
                point_pred = point_pred * indo_season_mult
                
                if model_p10 is not None and model_p90 is not None:
                    raw_pred_p10 = float(model_p10.predict(feat_df)[0])
                    raw_pred_p90 = float(model_p90.predict(feat_df)[0])
                    
                    lower_bound = np.expm1(raw_pred_p10) if use_log1p else raw_pred_p10
                    upper_bound = np.expm1(raw_pred_p90) if use_log1p else raw_pred_p90
                    
                    lower_bound = lower_bound * indo_season_mult
                    upper_bound = upper_bound * indo_season_mult
                else:
                    noise_band = residual_std * (1.0 + (step / (horizon * 2)))
                    lower_bound = point_pred - 1.28 * noise_band
                    upper_bound = point_pred + 1.28 * noise_band
            else:
                # Cold-Start / Fallback Bayesian Mode
                dow_factor = 1.15 if is_weekend else 1.0
                point_pred = baseline_mean * dow_factor * indo_season_mult
                noise_band = baseline_std * (1.0 + (step / (horizon * 2)))
                lower_bound = point_pred - 1.28 * noise_band
                upper_bound = point_pred + 1.28 * noise_band

            point_pred = max(0.5, round(float(point_pred), 1))
            lower_bound = max(0.0, round(float(lower_bound), 1))
            upper_bound = max(point_pred, round(float(upper_bound), 1))
            safety_buffer = round(float(upper_bound - point_pred), 1)

            forecast_qtys.append(point_pred)

            daily_predictions.append({
                "date": future_date.strftime('%Y-%m-%d'),
                "predicted_demand": point_pred,
                "lower_bound": lower_bound,
                "upper_bound": upper_bound,
                "safety_buffer": safety_buffer,
                "event_label": event_desc
            })

        total_14d_qty = round(sum(forecast_qtys))
        forecast_std_dev = round(float(np.std(forecast_qtys)), 2)
        if forecast_std_dev <= 0:
            forecast_std_dev = round(residual_std, 2)

        forecast_results.append({
            "product_id": str(pid),
            "product_name": str(prod_name),
            "unit_price_idr": unit_price,
            "unit_cost_idr": unit_cost,
            "current_stock": current_stock,
            "forecast_14d_qty": total_14d_qty,
            "forecast_std_dev": forecast_std_dev,
            "demand_profile": demand_profile,
            "historical_points": historical_points,
            "daily_predictions": daily_predictions
        })

    return forecast_results
