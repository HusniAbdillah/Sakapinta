import math
import numpy as np
from typing import List, Dict, Any

DEFAULT_SERVICE_LEVEL_Z = 1.65   # 95% service level standard normal quantile
DEFAULT_LEAD_TIME_DAYS = 3.0     # Mean distributor lead time in Indonesia
DEFAULT_LEAD_TIME_SIGMA = 0.6    # Distributor transit jitter/variance in days (Stochastic lead-time)

def apply_hybrid_decision_logic(
    forecast_items: List[Dict[str, Any]],
    service_level_z: float = DEFAULT_SERVICE_LEVEL_Z,
    supplier_lead_time_days: float = DEFAULT_LEAD_TIME_DAYS,
    lead_time_sigma: float = DEFAULT_LEAD_TIME_SIGMA
) -> Dict[str, Any]:
    """
    Executes the Industrial Hybrid Decision Support Layer:
    1. Computes Full Stochastic Joint Safety Stock: SS = Z * sqrt(L * sigma_D^2 + D_bar^2 * sigma_L^2)
    2. Calculates Recommended Reorder Quantity: Q_reorder = max(0, Forecast_14d + SS - CurrentStock)
    3. Evaluates Stockout Risk Scores (High / Medium / Low).
    4. Computes What-If Financial Projections (Capital Required vs. Potential Lost Sales).
    5. Determines Priority Ranking across all SKUs.
    """
    enriched_results = []

    for item in forecast_items:
        forecast_14d = item['forecast_14d_qty']
        std_dev_d = float(item['forecast_std_dev'])
        current_stock = float(item['current_stock'])
        unit_price = float(item['unit_price_idr'])
        unit_cost = float(item['unit_cost_idr'])
        
        l_mean = supplier_lead_time_days
        l_sigma = lead_time_sigma
        daily_avg_demand = max(0.5, forecast_14d / 14.0)

        # 1. Full Stochastic Joint Safety Stock Formulation:
        # SS = Z * sqrt( L * sigma_D^2 + D_bar^2 * sigma_L^2 )
        demand_variance_component = l_mean * (std_dev_d ** 2)
        lead_time_variance_component = (daily_avg_demand ** 2) * (l_sigma ** 2)
        total_stochastic_variance = demand_variance_component + lead_time_variance_component
        
        raw_safety_stock = service_level_z * math.sqrt(max(1.0, total_stochastic_variance))
        safety_stock_qty = max(2, math.ceil(raw_safety_stock))

        # 2. Recommended Reorder Quantity: Q_reorder = max(0, Forecast_14d + SS - CurrentStock)
        recommended_reorder_qty = max(0, math.ceil(forecast_14d + safety_stock_qty - current_stock))

        # 3. Financial Computations (IDR)
        estimated_cost_idr = round(recommended_reorder_qty * unit_cost)
        potential_lost_sales_idr = round(forecast_14d * unit_price)

        # 4. Stockout Risk Scoring Index (0 - 100)
        days_of_stock = current_stock / daily_avg_demand

        # Factor A: Stock Depletion Urgency (0-40 pts)
        if days_of_stock <= 3:
            stock_urgency_score = 40.0
        elif days_of_stock <= 7:
            stock_urgency_score = 25.0
        elif days_of_stock <= 14:
            stock_urgency_score = 12.0
        else:
            stock_urgency_score = 0.0

        # Factor B: Forecast Volatility Index (0-30 pts)
        cv = (std_dev_d / daily_avg_demand) if daily_avg_demand > 0 else 0.5
        volatility_score = min(30.0, cv * 25.0)

        # Factor C: Holiday Surge Multiplier presence (0-30 pts)
        has_holiday_surge = any("Regular" not in dp.get("event_label", "") for dp in item.get("daily_predictions", []))
        holiday_score = 30.0 if has_holiday_surge else 10.0

        # Composite Numeric Risk Score
        risk_score_numeric = round(min(100.0, stock_urgency_score + volatility_score + holiday_score), 1)

        # Categorical Risk Classification
        if risk_score_numeric >= 68.0:
            risk_score_cat = "High"
        elif risk_score_numeric >= 40.0:
            risk_score_cat = "Medium"
        else:
            risk_score_cat = "Low"

        # Priority Sorting Weight = Risk * Volume * Unit Margin
        unit_margin = max(1000.0, unit_price - unit_cost)
        priority_weight = (risk_score_numeric / 100.0) * forecast_14d * math.log10(max(10.0, unit_margin))

        # Demand Profile Classification
        demand_profile = item.get("demand_profile", "Fast-Moving Smooth")

        enriched_results.append({
            "product_id": item['product_id'],
            "product_name": item['product_name'],
            "unit_cost_idr": unit_cost,
            "unit_price_idr": unit_price,
            "current_stock": current_stock,
            "forecast_14d_qty": forecast_14d,
            "safety_stock_qty": safety_stock_qty,
            "recommended_reorder_qty": recommended_reorder_qty,
            "estimated_cost_idr": estimated_cost_idr,
            "potential_lost_sales_idr": potential_lost_sales_idr,
            "risk_score": risk_score_cat,
            "risk_score_numeric": risk_score_numeric,
            "priority_weight": priority_weight,
            "lead_time_days": round(l_mean, 1),
            "lead_time_sigma_days": round(l_sigma, 2),
            "demand_profile": demand_profile,
            "days_of_stock_remaining": round(days_of_stock, 1),
            "historical_points": item.get('historical_points', []),
            "daily_predictions": item.get('daily_predictions', [])
        })

    # 5. Rank by Priority Weight Descending
    enriched_results.sort(key=lambda x: x['priority_weight'], reverse=True)
    for rank_idx, res in enumerate(enriched_results, start=1):
        res['priority_rank'] = rank_idx
        res.pop('priority_weight', None)

    # 6. Aggregate Executive KPIs
    total_capital_required = sum(r['estimated_cost_idr'] for r in enriched_results)
    total_potential_lost_sales = sum(r['potential_lost_sales_idr'] for r in enriched_results)
    critical_items_count = sum(1 for r in enriched_results if r['risk_score'] == "High")
    total_skus = len(enriched_results)

    total_forecast_all = sum(r['forecast_14d_qty'] for r in enriched_results)
    total_safety_all = sum(r['safety_stock_qty'] for r in enriched_results)
    safety_ratio_pct = round((total_safety_all / total_forecast_all * 100), 1) if total_forecast_all > 0 else 0.0

    return {
        "status": "success",
        "horizon_days": 14,
        "summary": {
            "total_capital_required_idr": total_capital_required,
            "potential_lost_sales_idr": total_potential_lost_sales,
            "critical_items_count": critical_items_count,
            "total_skus_evaluated": total_skus,
            "average_safety_stock_ratio": f"{safety_ratio_pct}%",
            "service_level_target": "95.0% (Z=1.65)",
            "stochastic_model": "Joint Demand-LeadTime Variance Engine"
        },
        "results": enriched_results
    }
