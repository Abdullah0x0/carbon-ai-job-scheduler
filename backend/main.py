import uvicorn
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from api import router as api_router

app = FastAPI(title="Carbon-Aware AI Job Scheduler API")
# Include custom API routes
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
