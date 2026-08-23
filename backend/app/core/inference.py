import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.core.data_prep import calculate_indonesian_seasonality_index

HORIZON_DAYS = 14

def run_demand_inference(df: pd.DataFrame, horizon: int = HORIZON_DAYS) -> List[Dict[str, Any]]:
    """
    Executes time-series demand forecasting for every unique SKU in the dataset.
    Combines historical moving trend, day-of-week cyclic effects, Indonesian seasonality
    multipliers, and uncertainty variance bounds (P10/P90).
    """
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
        
        # Keep up to last 30 historical points for rich visualization
        historical_points = [
            {"date": d, "qty": round(float(q), 1)}
            for d, q in zip(hist_dates[-30:], hist_qtys[-30:])
        ]

        # Time-series baseline features
        recent_qty_series = pd.Series(hist_qtys)
        baseline_mean = recent_qty_series.tail(14).mean() if len(recent_qty_series) >= 14 else recent_qty_series.mean()
        baseline_std = recent_qty_series.tail(14).std() if len(recent_qty_series) >= 14 else recent_qty_series.std()
        if pd.isna(baseline_std) or baseline_std <= 0:
            baseline_std = max(1.5, baseline_mean * 0.20)

        # Estimate gentle momentum / trend
        if len(recent_qty_series) >= 7:
            slope = (recent_qty_series.iloc[-1] - recent_qty_series.iloc[-7]) / 7.0
            momentum = np.clip(slope * 0.3, -2.0, 2.0)
        else:
            momentum = 0.0

        # Day-of-week profile (normalized)
        prod_df_copy = prod_df.copy()
        prod_df_copy['dayofweek'] = prod_df_copy['date'].dt.dayofweek
        dow_means = prod_df_copy.groupby('dayofweek')['qty'].mean().to_dict()
        overall_mean = max(1.0, float(recent_qty_series.mean()))

        last_date = prod_df['date'].max()
        if pd.isna(last_date):
            last_date = datetime.now()

        daily_predictions = []
        forecast_qtys = []

        for step in range(1, horizon + 1):
            future_date = last_date + timedelta(days=step)
            dow = future_date.weekday()
            
            # 1. Day of week index
            dow_factor = (dow_means.get(dow, overall_mean) / overall_mean) if overall_mean > 0 else 1.0
            dow_factor = np.clip(dow_factor, 0.7, 1.4)

            # 2. Indonesian Calendar / Seasonality multiplier
            indo_season_mult, event_desc = calculate_indonesian_seasonality_index(future_date)

            # 3. Predicted point demand
            point_pred = (baseline_mean + momentum * (step / horizon)) * dow_factor * indo_season_mult
            point_pred = max(1.0, round(float(point_pred), 1))
            forecast_qtys.append(point_pred)

            # 4. Confidence intervals (P10 / P90 variance)
            noise_band = baseline_std * (1.0 + (step / (horizon * 2)))
            lower_bound = max(0.0, round(float(point_pred - 1.28 * noise_band), 1))
            upper_bound = round(float(point_pred + 1.28 * noise_band), 1)
            safety_buffer = round(float(upper_bound - point_pred), 1)

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
            forecast_std_dev = round(baseline_std, 2)

        forecast_results.append({
            "product_id": str(pid),
            "product_name": str(prod_name),
            "unit_price_idr": unit_price,
            "unit_cost_idr": unit_cost,
            "current_stock": current_stock,
            "forecast_14d_qty": total_14d_qty,
            "forecast_std_dev": forecast_std_dev,
            "historical_points": historical_points,
            "daily_predictions": daily_predictions
        })

    return forecast_results
