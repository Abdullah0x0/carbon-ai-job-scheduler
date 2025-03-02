from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import enum
import os

# Create SQLite database engine with absolute path
DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jobs.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Create engine with correct parameters
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True  # Enable SQL logging for debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(255), index=True)  # Specify length for String
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING)
    duration_hours = Column(Float)
    resource_usage = Column(String(50))  # Specify length for String
    scheduled_time = Column(DateTime, nullable=True)
    start_time = Column(DateTime, nullable=True)
    completion_time = Column(DateTime, nullable=True)
    carbon_intensity = Column(Float, nullable=True)
    carbon_saved = Column(Float, nullable=True)
    parameters = Column(JSON, nullable=True)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Drop existing tables and create new ones
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 