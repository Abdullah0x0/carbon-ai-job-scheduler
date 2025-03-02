# backend/api.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from carbon_data import get_carbon_intensity
from groq_inference import get_optimal_schedule
from insights import get_insights

router = APIRouter()

# Request model for scheduling
class Task(BaseModel):
    task_name: str
    duration_hours: float  # e.g., 3 hours
    resource_usage: str    # e.g., "GPU-heavy"

@router.post("/schedule")
async def schedule_task(task: Task):
    try:
        # 1. Fetch current carbon intensity data
        carbon_data = get_carbon_intensity()  # Contains "carbon_intensity", "unit", etc.

        # 2. Use Groq API for inference to generate scheduling recommendation
        recommendation = get_optimal_schedule(task, carbon_data)

        # 3. Get dynamic insights from Perplexity Pro
        insights = get_insights(task, carbon_data)

        # --- Compute additional metrics for analysis ---
        # Assume baseline is the current carbon intensity
        baseline_intensity = carbon_data["carbon_intensity"]
        # If recommendation provides an expected intensity, use that; otherwise, fallback to baseline
        optimized_intensity = recommendation.get("expected_intensity", baseline_intensity)
        # Calculate difference (amount reduced)
        carbon_difference = baseline_intensity - optimized_intensity
        # For money saved, assume a factor (e.g., $0.05 saved per unit reduction)
        money_saved = carbon_difference * 0.05

        analysis = {
            "baseline_intensity": baseline_intensity,
            "optimized_intensity": optimized_intensity,
            "carbon_difference": carbon_difference,
            "money_saved": money_saved,
            "unit": carbon_data.get("unit", "gCO2/kWh")
        }

        return {
            "task": task.dict(),
            "carbon_data": carbon_data,
            "recommendation": recommendation,
            "insights": insights,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
