from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router
import os

app = FastAPI()

# Configure CORS
origins = [
    # Development URLs
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    # Production URLs
    "https://carbon-ai-job-scheduler.vercel.app",
    "https://carbon-ai-job-scheduler-git-main.vercel.app",
    "https://carbon-ai-job-scheduler-*.vercel.app",  # Allow all preview deployments
    "https://carbon-ai-job-scheduler.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Mount the API router
app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Carbon-Aware AI Job Scheduler API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
