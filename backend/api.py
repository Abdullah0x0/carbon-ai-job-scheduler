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
        carbon_data = get_carbon_intensity()

        # 2. Use Groq API for inference to generate scheduling recommendation
        recommendation = get_optimal_schedule(task, carbon_data)

        # 3. Get dynamic insights from Perplexity Pro
        insights = get_insights(task, carbon_data)

        return {
            "task": task.dict(),
            "carbon_data": carbon_data,
            "recommendation": recommendation,
            "insights": insights,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
