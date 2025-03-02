from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

app = FastAPI()

# CSP Middleware
class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';"
        return response

# Configure CORS
origins = [
    # Development URLs
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    # Production URLs
    "https://carbon-ai-job-scheduler.vercel.app",
    "https://carbon-ai-job-scheduler.onrender.com"
]

app.add_middleware(CSPMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
