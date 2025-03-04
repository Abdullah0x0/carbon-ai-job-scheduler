from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from carbon_data import get_carbon_intensity, get_watttime_token
from groq_inference import get_optimal_schedule
from insights import get_insights
from models import Job, JobStatus, get_db, Base, engine
import json

router = APIRouter()

# Request model for scheduling
class Task(BaseModel):
    task_name: str
    duration_hours: float  # e.g., 3 hours
    resource_usage: str    # e.g., "GPU-heavy"

# Response models
class JobBase(BaseModel):
    id: int
    task_name: str
    status: JobStatus
    duration_hours: float
    resource_usage: str
    scheduled_time: Optional[datetime]
    carbon_intensity: Optional[float]
    carbon_saved: Optional[float]
    created_at: datetime
    parameters: Optional[dict] = None
    results: Optional[dict] = None

    class Config:
        orm_mode = True
        from_attributes = True

    @property
    def confidence_score(self) -> Optional[float]:
        if not self.parameters:
            return None
        return self.parameters.get("confidence_score")

    @property
    def reasoning(self) -> Optional[str]:
        if not self.parameters:
            return None
        return self.parameters.get("reasoning")

    @property
    def expected_intensity(self) -> Optional[float]:
        if not self.parameters or "recommendation" not in self.parameters:
            return None
        return self.parameters["recommendation"].get("expected_intensity")

    @property
    def alternative_windows(self) -> Optional[list]:
        if not self.parameters or "recommendation" not in self.parameters:
            return None
        return self.parameters["recommendation"].get("alternative_windows", [])

@router.post("/schedule")
async def schedule_task(task: Task, db: Session = Depends(get_db)):
    try:
        # 1. Fetch current carbon intensity data
        carbon_data = get_carbon_intensity()
        if not carbon_data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch carbon intensity data"
            )

        # 2. Use Groq API for inference
        recommendation = get_optimal_schedule(task, carbon_data)
        if not recommendation:
            # If recommendation fails, create a basic recommendation
            current_time = datetime.now().isoformat()
            recommendation = {
                "recommended_start_time": current_time,
                "expected_intensity": carbon_data.get("carbon_intensity", 0),
                "carbon_savings_estimate": 0,
                "confidence_score": 0.5,
                "reasoning": "Using default schedule due to optimization service unavailability",
                "alternative_windows": []
            }

        # 3. Get insights
        try:
            insights = get_insights(task, carbon_data)
        except Exception as e:
            print(f"Error getting insights: {e}")
            insights = {
                "summary": "Insights temporarily unavailable",
                "recommendations": []
            }

        # Calculate metrics
        baseline_intensity = carbon_data.get("carbon_intensity", 0)
        optimized_intensity = recommendation.get("expected_intensity", baseline_intensity)
        carbon_difference = baseline_intensity - optimized_intensity
        money_saved = carbon_difference * 0.05

        analysis = {
            "baseline_intensity": baseline_intensity,
            "optimized_intensity": optimized_intensity,
            "carbon_difference": carbon_difference,
            "money_saved": money_saved,
            "unit": carbon_data.get("unit", "gCO2/kWh"),
            "data_source": "real" if carbon_data.get("location") != "SIMULATED_CAISO_NORTH" else "simulated"
        }

        # Create job record
        db_job = Job(
            task_name=task.task_name,
            duration_hours=task.duration_hours,
            resource_usage=task.resource_usage,
            scheduled_time=datetime.fromisoformat(recommendation.get("recommended_start_time", datetime.now().isoformat()).replace('Z', '+00:00')),
            carbon_intensity=baseline_intensity,
            carbon_saved=recommendation.get("carbon_savings_estimate", 0),
            parameters={
                "task": task.dict(),
                "carbon_data": carbon_data,
                "recommendation": recommendation,
                "confidence_score": recommendation.get("confidence_score", 0.7),
                "reasoning": recommendation.get("reasoning", "Optimized for lower carbon intensity")
            },
            results={
                "insights": insights,
                "analysis": analysis
            }
        )
        
        db.add(db_job)
        db.commit()
        db.refresh(db_job)

        return {
            "job_id": db_job.id,
            "task": task.dict(),
            "carbon_data": carbon_data,
            "recommendation": recommendation,
            "insights": insights,
            "analysis": db_job.results["analysis"]
        }
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        print(f"Error in schedule_task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to schedule task",
                "error": str(e),
                "type": "internal_error"
            }
        )

@router.get("/jobs", response_model=List[JobBase])
async def get_jobs(db: Session = Depends(get_db)):
    try:
        jobs = db.query(Job).order_by(desc(Job.created_at)).all()
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}", response_model=JobBase)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/{job_id}")
async def cancel_job(job_id: int, db: Session = Depends(get_db)):
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.status == JobStatus.PENDING:
            job.status = JobStatus.CANCELLED
            db.commit()
            return {"message": "Job cancelled successfully"}
        raise HTTPException(status_code=400, detail="Can only cancel pending jobs")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/clear")
async def clear_jobs(db: Session = Depends(get_db)):
    """Clear all jobs from the queue"""
    try:
        # Execute raw SQL to delete all jobs
        db.execute("DELETE FROM jobs")
        db.commit()
        return {"status": "success", "message": "Job queue cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to clear job queue")

@router.get("/test/watttime")
async def test_watttime():
    """Test endpoint to check WattTime API status"""
    try:
        token = get_watttime_token()
        if not token:
            return {
                "status": "error",
                "message": "Failed to get WattTime token",
                "details": "Check the logs for more information"
            }
        
        carbon_data = get_carbon_intensity()
        if not carbon_data:
            return {
                "status": "error",
                "message": "Failed to get carbon intensity data",
                "details": "Check the logs for more information"
            }
        
        return {
            "status": "success",
            "message": "WattTime API is working",
            "data": {
                "location": carbon_data.get("location"),
                "carbon_intensity": carbon_data.get("carbon_intensity"),
                "unit": carbon_data.get("unit"),
                "timestamp": carbon_data.get("timestamp"),
                "is_simulated": carbon_data.get("location") == "SIMULATED_CAISO_NORTH"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error testing WattTime API: {str(e)}",
            "error_type": type(e).__name__
        }
