from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TimeGranularity(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class QueryParams(BaseModel):
    """Base query parameters for all endpoints."""
    start_date: Optional[str] = Field(None, description="Start date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="End date in YYYY-MM-DD format")
    granularity: TimeGranularity = Field(TimeGranularity.DAILY, description="Time granularity")
    provider: Optional[str] = Field(None, description="Filter by API provider")
    feature: Optional[str] = Field(None, description="Filter by endpoint/feature")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of results")

class TimeSeriesPoint(BaseModel):
    """Single data point in time series."""
    timestamp: datetime
    value: float
    metadata: Optional[Dict[str, Any]] = None

class CostTimeSeriesResponse(BaseModel):
    """Response for cost time series endpoint."""
    period: Dict[str, Optional[str]]  # start_date, end_date
    granularity: str
    data: List[TimeSeriesPoint]
    total_cost: float
    total_requests: int
    avg_cost_per_request: float
    filters: Optional[Dict[str, Any]] = None

class CostBreakdownItem(BaseModel):
    """Individual breakdown item."""
    key: str  # provider name, feature name, etc.
    total_cost: float
    percentage: float
    request_count: int
    avg_cost_per_request: float
    trend: Optional[str] = None  # "increasing", "decreasing", "stable"

class CostBreakdownResponse(BaseModel):
    """Response for cost breakdown endpoints."""
    period: Dict[str, Optional[str]]  # start_date, end_date
    breakdown: List[CostBreakdownItem]
    total_cost: float
    total_requests: int
    total_items: int

class AnomalyType(str, Enum):
    COST_SPIKE = "cost_spike"
    UNUSUAL_PATTERN = "unusual_pattern"
    THRESHOLD_BREACH = "threshold_breach"

class AnomalySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AnomalyResponse(BaseModel):
    """Response for anomaly detection endpoint."""
    id: str
    timestamp: datetime
    anomaly_type: AnomalyType
    severity: AnomalySeverity
    description: str
    cost_value: float
    expected_value: Optional[float] = None
    deviation_percentage: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class RecommendationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class RecommendationType(str, Enum):
    COST_OPTIMIZATION = "cost_optimization"
    PERFORMANCE_IMPROVEMENT = "performance_improvement"
    USAGE_OPTIMIZATION = "usage_optimization"
    ARCHITECTURE_CHANGE = "architecture_change"

class OptimizationRecommendation(BaseModel):
    """Response for optimization recommendations."""
    id: str
    title: str
    description: str
    recommendation_type: RecommendationType
    priority: RecommendationPriority
    estimated_savings: Optional[float] = None
    implementation_effort: Optional[str] = None
    impact_score: float = Field(..., ge=0, le=10)
    related_metrics: Optional[Dict[str, float]] = None
    action_items: Optional[List[str]] = None

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime
    version: Optional[str] = None
    database_status: Optional[str] = None