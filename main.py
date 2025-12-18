from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import os
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import asyncio

from database import CostRecord, CostAggregation, get_db, init_db
from schemas import (
    CostTimeSeriesResponse, 
    CostBreakdownResponse,
    AnomalyResponse,
    OptimizationRecommendation,
    QueryParams,
    TimeSeriesPoint
)
from services.analytics_service import AnalyticsService
from services.caching_service import CachingService
from utils.query_builder import QueryBuilder
from utils.aggregation import AggregationUtils

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Cost Analytics Dashboard API",
    description="Backend API for cost analytics dashboard with time-series data, breakdowns, and optimization recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
analytics_service = AnalyticsService()
caching_service = CachingService()

@app.get("/")
async def root():
    return {"message": "Cost Analytics Dashboard API", "version": "1.0.0"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/api/v1/costs/time-series", response_model=CostTimeSeriesResponse)
async def get_costs_time_series(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    granularity: str = Query("daily", regex="^(daily|weekly|monthly)$", description="Time granularity"),
    provider: Optional[str] = Query(None, description="Filter by API provider"),
    feature: Optional[str] = Query(None, description="Filter by endpoint/feature"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of data points")
):
    """Get total costs over time period with flexible date ranges and filters."""
    
    # Use query builder to construct the query
    from database import SessionLocal
    db = SessionLocal()
    try:
        query_builder = QueryBuilder(db)
        base_query = query_builder.build_cost_time_series_query(
            start_date=start_date,
            end_date=end_date,
            granularity=granularity,
            provider=provider,
            feature=feature,
            limit=limit
        )
    finally:
        db.close()
    
    # Check cache first
    cache_key = f"costs_time_series_{hash(str(base_query))}"
    cached_result = await caching_service.get(cache_key)
    if cached_result:
        return cached_result
    
    # Get data from analytics service
    result = await analytics_service.get_costs_time_series(
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
        provider=provider,
        feature=feature,
        limit=limit
    )
    
    # Cache the result
    await caching_service.set(cache_key, result, ttl=300)  # 5 minutes
    
    return result

@app.get("/api/v1/costs/breakdown/provider", response_model=CostBreakdownResponse)
async def get_costs_by_provider(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    limit: int = Query(10, ge=1, le=50, description="Number of providers to return")
):
    """Get cost breakdown by API provider."""
    
    # Check cache
    cache_key = f"costs_by_provider_{start_date}_{end_date}_{limit}"
    cached_result = await caching_service.get(cache_key)
    if cached_result:
        return cached_result
    
    result = await analytics_service.get_costs_by_provider(
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )
    
    # Cache for 10 minutes
    await caching_service.set(cache_key, result, ttl=600)
    
    return result

@app.get("/api/v1/costs/breakdown/feature", response_model=CostBreakdownResponse)
async def get_costs_by_feature(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    provider: Optional[str] = Query(None, description="Filter by provider"),
    limit: int = Query(10, ge=1, le=50, description="Number of features to return")
):
    """Get cost breakdown by endpoint/feature."""
    
    # Check cache
    cache_key = f"costs_by_feature_{start_date}_{end_date}_{provider}_{limit}"
    cached_result = await caching_service.get(cache_key)
    if cached_result:
        return cached_result
    
    result = await analytics_service.get_costs_by_feature(
        start_date=start_date,
        end_date=end_date,
        provider=provider,
        limit=limit
    )
    
    # Cache for 10 minutes
    await caching_service.set(cache_key, result, ttl=600)
    
    return result

@app.get("/api/v1/costs/anomalies", response_model=List[AnomalyResponse])
async def get_cost_anomalies(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    sensitivity: float = Query(2.0, ge=1.0, le=5.0, description="Anomaly detection sensitivity (higher = more sensitive)"),
    min_cost: float = Query(0.01, ge=0.01, description="Minimum cost threshold for anomalies")
):
    """Get cost anomalies (unusual spikes) in the specified period."""
    
    # Check cache
    cache_key = f"cost_anomalies_{start_date}_{end_date}_{sensitivity}_{min_cost}"
    cached_result = await caching_service.get(cache_key)
    if cached_result:
        return cached_result
    
    result = await analytics_service.get_cost_anomalies(
        start_date=start_date,
        end_date=end_date,
        sensitivity=sensitivity,
        min_cost=min_cost
    )
    
    # Cache for 15 minutes
    await caching_service.set(cache_key, result, ttl=900)
    
    return result

@app.get("/api/v1/costs/recommendations", response_model=List[OptimizationRecommendation])
async def get_optimization_recommendations(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    max_recommendations: int = Query(10, ge=1, le=50, description="Maximum number of recommendations")
):
    """Get cost optimization recommendations based on usage patterns."""
    
    # Check cache
    cache_key = f"optimization_recommendations_{start_date}_{end_date}_{max_recommendations}"
    cached_result = await caching_service.get(cache_key)
    if cached_result:
        return cached_result
    
    result = await analytics_service.get_optimization_recommendations(
        start_date=start_date,
        end_date=end_date,
        max_recommendations=max_recommendations
    )
    
    # Cache for 30 minutes (recommendations change less frequently)
    await caching_service.set(cache_key, result, ttl=1800)
    
    return result

@app.post("/api/v1/costs/sample-data")
async def generate_sample_data(count: int = Query(1000, ge=1, le=10000, description="Number of sample records to generate")):
    """Generate sample cost data for testing and development."""
    await analytics_service.generate_sample_data(count)
    return {"message": f"Generated {count} sample cost records"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)