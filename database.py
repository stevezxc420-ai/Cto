from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from datetime import datetime
import os

Base = declarative_base()

class CostRecord(Base):
    """Individual cost record for each API call."""
    __tablename__ = "cost_records"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    provider = Column(String(100), index=True, nullable=False)
    feature = Column(String(200), index=True, nullable=False)
    endpoint = Column(String(200), index=True, nullable=False)
    cost = Column(Float, nullable=False)
    response_time_ms = Column(Float, nullable=True)
    status_code = Column(Integer, nullable=True)
    request_size_bytes = Column(Integer, nullable=True)
    response_size_bytes = Column(Integer, nullable=True)
    user_id = Column(String(100), index=True, nullable=True)
    api_key_id = Column(String(100), index=True, nullable=True)
    additional_data = Column(String(1000), nullable=True)  # JSON string for additional data
    created_at = Column(DateTime, default=func.now())
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_cost_timestamp', 'timestamp'),
        Index('idx_cost_provider_timestamp', 'provider', 'timestamp'),
        Index('idx_cost_feature_timestamp', 'feature', 'timestamp'),
        Index('idx_cost_endpoint_timestamp', 'endpoint', 'timestamp'),
        Index('idx_cost_user_timestamp', 'user_id', 'timestamp'),
    )

class CostAggregation(Base):
    """Pre-aggregated cost data for faster queries."""
    __tablename__ = "cost_aggregations"
    
    id = Column(Integer, primary_key=True)
    period_start = Column(DateTime, index=True, nullable=False)
    period_end = Column(DateTime, index=True, nullable=False)
    granularity = Column(String(20), index=True, nullable=False)  # 'daily', 'weekly', 'monthly'
    provider = Column(String(100), index=True, nullable=True)  # null for overall totals
    feature = Column(String(200), index=True, nullable=True)   # null for overall totals
    endpoint = Column(String(200), index=True, nullable=True)  # null for overall totals
    total_cost = Column(Float, nullable=False)
    total_requests = Column(Integer, nullable=False)
    avg_cost_per_request = Column(Float, nullable=False)
    p95_response_time = Column(Float, nullable=True)
    success_rate = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Unique constraint to prevent duplicates
    __table_args__ = (
        Index('idx_aggregation_unique', 'period_start', 'period_end', 'granularity', 'provider', 'feature', 'endpoint', unique=True),
    )

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cost_analytics.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()