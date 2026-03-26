from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from sqlalchemy.sql import Selectable
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from database import CostRecord

class QueryBuilder:
    """Build complex SQL queries for cost analytics with flexible filtering."""
    
    def __init__(self, db: Session = None):
        self.db = db
    
    def build_cost_time_series_query(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        granularity: str = "daily",
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        endpoint: Optional[str] = None,
        user_id: Optional[str] = None,
        min_cost: Optional[float] = None,
        max_cost: Optional[float] = None,
        limit: int = 100
    ) -> Selectable:
        """Build query for cost time series data."""
        
        # Set default date range
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Determine grouping function based on granularity
        if granularity == "daily":
            group_func = func.date(CostRecord.timestamp)
            date_format = "%Y-%m-%d"
        elif granularity == "weekly":
            group_func = func.strftime("%Y-%W", CostRecord.timestamp)
            date_format = "%Y-%W"
        elif granularity == "monthly":
            group_func = func.strftime("%Y-%m", CostRecord.timestamp)
            date_format = "%Y-%m"
        else:
            raise ValueError(f"Unsupported granularity: {granularity}")
        
        # Build base query
        query = self.db.query(
            group_func.label("period"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request"),
            func.min(CostRecord.cost).label("min_cost"),
            func.max(CostRecord.cost).label("max_cost")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        )
        
        # Apply filters
        query = self._apply_filters(
            query, provider, feature, endpoint, user_id, min_cost, max_cost
        )
        
        # Group and order
        query = query.group_by("period").order_by("period").limit(limit)
        
        return query
    
    def build_cost_breakdown_query(
        self,
        dimension: str,  # "provider", "feature", "endpoint"
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        endpoint: Optional[str] = None,
        user_id: Optional[str] = None,
        min_cost: Optional[float] = None,
        max_cost: Optional[float] = None,
        limit: int = 10,
        sort_by: str = "total_cost",
        sort_order: str = "desc"
    ) -> Selectable:
        """Build query for cost breakdown by dimension."""
        
        # Set default date range
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Determine dimension column
        if dimension == "provider":
            dimension_col = CostRecord.provider
        elif dimension == "feature":
            dimension_col = CostRecord.feature
        elif dimension == "endpoint":
            dimension_col = CostRecord.endpoint
        else:
            raise ValueError(f"Unsupported dimension: {dimension}")
        
        # Build base query
        query = self.db.query(
            dimension_col.label("dimension"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request"),
            func.min(CostRecord.cost).label("min_cost"),
            func.max(CostRecord.cost).label("max_cost"),
            func.count(func.distinct(CostRecord.endpoint)).label("unique_endpoints")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        )
        
        # Apply filters
        query = self._apply_filters(
            query, provider, feature, endpoint, user_id, min_cost, max_cost
        )
        
        # Group by dimension
        query = query.group_by(dimension_col)
        
        # Apply sorting
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_by))
        else:
            query = query.order_by(sort_by)
        
        query = query.limit(limit)
        
        return query
    
    def build_anomaly_detection_query(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        granularity: str = "daily",
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        min_requests: int = 1
    ) -> Selectable:
        """Build query for anomaly detection data."""
        
        # Set default date range
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Determine grouping function
        if granularity == "daily":
            group_func = func.date(CostRecord.timestamp)
        elif granularity == "weekly":
            group_func = func.strftime("%Y-%W", CostRecord.timestamp)
        elif granularity == "monthly":
            group_func = func.strftime("%Y-%m", CostRecord.timestamp)
        else:
            group_func = func.date(CostRecord.timestamp)
        
        # Build base query for time series analysis
        query = self.db.query(
            group_func.label("period"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request"),
            func.stddev(CostRecord.cost).label("cost_stddev")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        )
        
        # Apply filters
        if provider:
            query = query.filter(CostRecord.provider == provider)
        if feature:
            query = query.filter(CostRecord.feature == feature)
        
        query = query.group_by("period").having(
            func.count(CostRecord.id) >= min_requests
        ).order_by("period")
        
        return query
    
    def build_user_cost_query(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        min_cost: Optional[float] = None,
        limit: int = 100
    ) -> Selectable:
        """Build query for user-based cost analysis."""
        
        # Set default date range
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Build base query
        query = self.db.query(
            CostRecord.user_id.label("user_id"),
            CostRecord.provider.label("provider"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request"),
            func.min(CostRecord.timestamp).label("first_request"),
            func.max(CostRecord.timestamp).label("last_request")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt,
                CostRecord.user_id.isnot(None)
            )
        )
        
        # Apply filters
        if provider:
            query = query.filter(CostRecord.provider == provider)
        if feature:
            query = query.filter(CostRecord.feature == feature)
        if min_cost:
            query = query.filter(func.sum(CostRecord.cost) >= min_cost)
        
        query = query.group_by(
            CostRecord.user_id, CostRecord.provider
        ).order_by(desc("total_cost")).limit(limit)
        
        return query
    
    def _apply_filters(
        self,
        query,
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        endpoint: Optional[str] = None,
        user_id: Optional[str] = None,
        min_cost: Optional[float] = None,
        max_cost: Optional[float] = None
    ):
        """Apply common filters to a query."""
        
        if provider:
            query = query.filter(CostRecord.provider == provider)
        if feature:
            query = query.filter(CostRecord.feature == feature)
        if endpoint:
            query = query.filter(CostRecord.endpoint == endpoint)
        if user_id:
            query = query.filter(CostRecord.user_id == user_id)
        if min_cost:
            query = query.filter(CostRecord.cost >= min_cost)
        if max_cost:
            query = query.filter(CostRecord.cost <= max_cost)
        
        return query
    
    def build_advanced_filter_query(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        providers: Optional[List[str]] = None,
        features: Optional[List[str]] = None,
        endpoints: Optional[List[str]] = None,
        user_ids: Optional[List[str]] = None,
        cost_range: Optional[tuple] = None,
        response_time_range: Optional[tuple] = None,
        status_codes: Optional[List[int]] = None,
        date_hours: Optional[List[int]] = None,  # Filter by hour of day
        exclude_weekends: bool = False
    ) -> Selectable:
        """Build query with advanced filtering options."""
        
        # Set default date range
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Build base query
        query = self.db.query(CostRecord).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        )
        
        # Apply filters
        if providers:
            query = query.filter(CostRecord.provider.in_(providers))
        if features:
            query = query.filter(CostRecord.feature.in_(features))
        if endpoints:
            query = query.filter(CostRecord.endpoint.in_(endpoints))
        if user_ids:
            query = query.filter(CostRecord.user_id.in_(user_ids))
        if cost_range:
            query = query.filter(
                and_(
                    CostRecord.cost >= cost_range[0],
                    CostRecord.cost <= cost_range[1]
                )
            )
        if response_time_range:
            query = query.filter(
                and_(
                    CostRecord.response_time_ms >= response_time_range[0],
                    CostRecord.response_time_ms <= response_time_range[1]
                )
            )
        if status_codes:
            query = query.filter(CostRecord.status_code.in_(status_codes))
        if date_hours:
            query = query.filter(func.strftime("%H", CostRecord.timestamp).in_(date_hours))
        if exclude_weekends:
            # Exclude Saturday (6) and Sunday (0)
            query = query.filter(func.strftime("%w", CostRecord.timestamp).notin_(["0", "6"]))
        
        return query.order_by(desc(CostRecord.timestamp))
    
    def get_query_stats(self, query: Selectable) -> Dict[str, Any]:
        """Get statistics about a query without executing it."""
        # This would typically involve EXPLAIN queries or query analysis
        # For now, return basic query structure info
        return {
            "query_type": str(type(query)),
            "base_model": "CostRecord",
            "filters_applied": True,  # Would need to parse query to determine this
            "group_by_applied": "GROUP BY" in str(query),
            "order_by_applied": "ORDER BY" in str(query)
        }