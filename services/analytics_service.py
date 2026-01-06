from sqlalchemy.orm import Session
from sqlalchemy import text, func, and_, or_, desc
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
import statistics
import numpy as np
from scipy import stats

from database import CostRecord, CostAggregation, get_db
from schemas import (
    CostTimeSeriesResponse,
    CostBreakdownResponse,
    CostBreakdownItem,
    AnomalyResponse,
    OptimizationRecommendation,
    TimeSeriesPoint,
    AnomalyType,
    AnomalySeverity,
    RecommendationType,
    RecommendationPriority
)
from utils.aggregation import AggregationUtils
from utils.date_utils import DateUtils

class AnalyticsService:
    """Main service for cost analytics calculations."""
    
    def __init__(self):
        self.db = next(get_db())
        self.aggregation_utils = AggregationUtils()
        self.date_utils = DateUtils()
    
    async def get_costs_time_series(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        granularity: str = "daily",
        provider: Optional[str] = None,
        feature: Optional[str] = None,
        limit: int = 100
    ) -> CostTimeSeriesResponse:
        """Get total costs over time period with specified granularity."""
        
        # Set default date range (last 30 days)
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Parse dates
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Build query based on granularity
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
            func.avg(CostRecord.cost).label("avg_cost")
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
        
        # Group and order
        query = query.group_by("period").order_by("period").limit(limit)
        
        results = query.all()
        
        # Convert to response format
        data_points = []
        for result in results:
            data_points.append(TimeSeriesPoint(
                timestamp=datetime.strptime(result.period, date_format),
                value=float(result.total_cost or 0),
                metadata={
                    "total_requests": int(result.total_requests or 0),
                    "avg_cost_per_request": float(result.avg_cost or 0)
                }
            ))
        
        # Calculate totals
        total_cost = sum(point.value for point in data_points)
        total_requests = sum(point.metadata["total_requests"] for point in data_points)
        avg_cost_per_request = total_cost / total_requests if total_requests > 0 else 0
        
        return CostTimeSeriesResponse(
            period={
                "start_date": start_date,
                "end_date": end_date
            },
            granularity=granularity,
            data=data_points,
            total_cost=total_cost,
            total_requests=total_requests,
            avg_cost_per_request=avg_cost_per_request,
            filters={
                "provider": provider,
                "feature": feature
            }
        )
    
    async def get_costs_by_provider(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 10
    ) -> CostBreakdownResponse:
        """Get cost breakdown by API provider."""
        
        # Set default date range (last 30 days)
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Query costs by provider
        query = self.db.query(
            CostRecord.provider.label("provider"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        ).group_by(CostRecord.provider).order_by(desc("total_cost")).limit(limit)
        
        results = query.all()
        
        # Calculate total for percentage calculations
        total_cost = sum(float(r.total_cost or 0) for r in results)
        
        # Build breakdown items
        breakdown = []
        for result in results:
            cost = float(result.total_cost or 0)
            percentage = (cost / total_cost * 100) if total_cost > 0 else 0
            
            breakdown.append(CostBreakdownItem(
                key=result.provider,
                total_cost=cost,
                percentage=percentage,
                request_count=int(result.total_requests or 0),
                avg_cost_per_request=float(result.avg_cost_per_request or 0),
                trend=self._calculate_trend(result.provider, start_dt, end_dt)
            ))
        
        return CostBreakdownResponse(
            period={
                "start_date": start_date,
                "end_date": end_date
            },
            breakdown=breakdown,
            total_cost=total_cost,
            total_requests=sum(item.request_count for item in breakdown),
            total_items=len(breakdown)
        )
    
    async def get_costs_by_feature(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        provider: Optional[str] = None,
        limit: int = 10
    ) -> CostBreakdownResponse:
        """Get cost breakdown by endpoint/feature."""
        
        # Set default date range (last 30 days)
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Query costs by feature
        query = self.db.query(
            CostRecord.feature.label("feature"),
            func.sum(CostRecord.cost).label("total_cost"),
            func.count(CostRecord.id).label("total_requests"),
            func.avg(CostRecord.cost).label("avg_cost_per_request")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        )
        
        # Apply provider filter if specified
        if provider:
            query = query.filter(CostRecord.provider == provider)
        
        query = query.group_by(CostRecord.feature).order_by(desc("total_cost")).limit(limit)
        
        results = query.all()
        
        # Calculate total for percentage calculations
        total_cost = sum(float(r.total_cost or 0) for r in results)
        
        # Build breakdown items
        breakdown = []
        for result in results:
            cost = float(result.total_cost or 0)
            percentage = (cost / total_cost * 100) if total_cost > 0 else 0
            
            breakdown.append(CostBreakdownItem(
                key=result.feature,
                total_cost=cost,
                percentage=percentage,
                request_count=int(result.total_requests or 0),
                avg_cost_per_request=float(result.avg_cost_per_request or 0),
                trend=self._calculate_trend(result.feature, start_dt, end_dt, is_feature=True)
            ))
        
        return CostBreakdownResponse(
            period={
                "start_date": start_date,
                "end_date": end_date
            },
            breakdown=breakdown,
            total_cost=total_cost,
            total_requests=sum(item.request_count for item in breakdown),
            total_items=len(breakdown)
        )
    
    async def get_cost_anomalies(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sensitivity: float = 2.0,
        min_cost: float = 0.01
    ) -> List[AnomalyResponse]:
        """Detect cost anomalies using statistical methods."""
        
        # Set default date range (last 30 days)
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Get daily cost data
        query = self.db.query(
            func.date(CostRecord.timestamp).label("date"),
            func.sum(CostRecord.cost).label("daily_cost"),
            func.count(CostRecord.id).label("request_count")
        ).filter(
            and_(
                CostRecord.timestamp >= start_dt,
                CostRecord.timestamp <= end_dt
            )
        ).group_by(func.date(CostRecord.timestamp)).order_by("date")
        
        results = query.all()
        
        if len(results) < 7:  # Need at least a week of data
            return []
        
        # Extract costs for statistical analysis
        daily_costs = [float(r.daily_cost) for r in results]
        dates = [r.date for r in results]
        
        # Calculate statistics
        mean_cost = statistics.mean(daily_costs)
        std_dev = statistics.stdev(daily_costs) if len(daily_costs) > 1 else 0
        threshold = mean_cost + (sensitivity * std_dev)
        
        anomalies = []
        
        for i, (date, cost) in enumerate(zip(dates, daily_costs)):
            if cost >= threshold and cost >= min_cost:
                deviation_pct = ((cost - mean_cost) / mean_cost * 100) if mean_cost > 0 else 0
                
                # Determine severity
                if deviation_pct > 500:
                    severity = AnomalySeverity.CRITICAL
                elif deviation_pct > 200:
                    severity = AnomalySeverity.HIGH
                elif deviation_pct > 100:
                    severity = AnomalySeverity.MEDIUM
                else:
                    severity = AnomalySeverity.LOW
                
                # Check if it's part of a trend
                is_spike = i > 0 and i < len(daily_costs) - 1 and \
                          daily_costs[i] > daily_costs[i-1] * 2 and \
                          daily_costs[i] > daily_costs[i+1] * 2
                
                anomaly_type = AnomalyType.COST_SPIKE if is_spike else AnomalyType.THRESHOLD_BREACH
                
                # Convert date string to datetime if needed
                if isinstance(date, str):
                    date = datetime.strptime(date, "%Y-%m-%d")
                
                anomalies.append(AnomalyResponse(
                    id=f"anomaly_{date.strftime('%Y%m%d')}",
                    timestamp=date,
                    anomaly_type=anomaly_type,
                    severity=severity,
                    description=f"Cost anomaly detected on {date.strftime('%Y-%m-%d')}: ${cost:.4f} (expected: ${mean_cost:.4f})",
                    cost_value=cost,
                    expected_value=mean_cost,
                    deviation_percentage=deviation_pct,
                    metadata={
                        "request_count": results[i].request_count,
                        "threshold": threshold,
                        "std_dev": std_dev
                    }
                ))
        
        return anomalies
    
    async def get_optimization_recommendations(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        max_recommendations: int = 10
    ) -> List[OptimizationRecommendation]:
        """Generate cost optimization recommendations."""
        
        # Set default date range (last 30 days)
        if not start_date:
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=30)
            start_date = start_dt.strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.utcnow().strftime("%Y-%m-%d")
        
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        recommendations = []
        
        # 1. High-cost provider recommendations
        provider_breakdown = await self.get_costs_by_provider(start_date, end_date, limit=5)
        for item in provider_breakdown.breakdown:
            if item.percentage > 50:  # Provider accounts for >50% of costs
                recommendations.append(OptimizationRecommendation(
                    id=f"provider_optimization_{item.key}",
                    title=f"Optimize {item.key} Usage",
                    description=f"{item.key} accounts for {item.percentage:.1f}% of total costs. Consider negotiating better rates or optimizing usage patterns.",
                    recommendation_type=RecommendationType.COST_OPTIMIZATION,
                    priority=RecommendationPriority.HIGH if item.percentage > 70 else RecommendationPriority.MEDIUM,
                    estimated_savings=item.total_cost * 0.15,  # Estimate 15% savings
                    implementation_effort="Medium",
                    impact_score=8.0 if item.percentage > 70 else 6.0,
                    related_metrics={
                        "current_cost": item.total_cost,
                        "percentage_of_total": item.percentage,
                        "avg_cost_per_request": item.avg_cost_per_request
                    },
                    action_items=[
                        "Review current usage patterns",
                        "Negotiate volume discounts",
                        "Implement usage monitoring",
                        "Consider alternative providers"
                    ]
                ))
        
        # 2. High-cost feature recommendations
        feature_breakdown = await self.get_costs_by_feature(start_date, end_date, limit=5)
        for item in feature_breakdown.breakdown:
            if item.avg_cost_per_request > 1.0:  # High cost per request
                recommendations.append(OptimizationRecommendation(
                    id=f"feature_optimization_{item.key}",
                    title=f"Optimize {item.key} Feature",
                    description=f"Feature '{item.key}' has high average cost per request (${item.avg_cost_per_request:.4f}). Consider optimization or caching.",
                    recommendation_type=RecommendationType.PERFORMANCE_IMPROVEMENT,
                    priority=RecommendationPriority.MEDIUM,
                    estimated_savings=item.total_cost * 0.20,  # Estimate 20% savings
                    implementation_effort="High",
                    impact_score=7.0,
                    related_metrics={
                        "current_cost": item.total_cost,
                        "avg_cost_per_request": item.avg_cost_per_request,
                        "request_count": item.request_count
                    },
                    action_items=[
                        "Analyze feature usage patterns",
                        "Implement caching strategy",
                        "Optimize feature logic",
                        "Consider feature flags"
                    ]
                ))
        
        # 3. Anomaly-based recommendations
        anomalies = await self.get_cost_anomalies(start_date, end_date, sensitivity=2.0)
        if anomalies:
            high_severity_anomalies = [a for a in anomalies if a.severity in [AnomalySeverity.HIGH, AnomalySeverity.CRITICAL]]
            if high_severity_anomalies:
                recommendations.append(OptimizationRecommendation(
                    id="anomaly_investigation",
                    title="Investigate Cost Anomalies",
                    description=f"Detected {len(high_severity_anomalies)} high-severity cost anomalies. Investigate root causes to prevent future spikes.",
                    recommendation_type=RecommendationType.USAGE_OPTIMIZATION,
                    priority=RecommendationPriority.HIGH,
                    estimated_savings=sum(a.cost_value - a.expected_value for a in high_severity_anomalies if a.expected_value),
                    implementation_effort="Medium",
                    impact_score=9.0,
                    related_metrics={
                        "anomaly_count": len(high_severity_anomalies),
                        "total_extra_cost": sum(a.cost_value - a.expected_value for a in high_severity_anomalies if a.expected_value)
                    },
                    action_items=[
                        "Review application logs for the anomaly periods",
                        "Check for code deployments or configuration changes",
                        "Implement alerting for cost spikes",
                        "Review API usage patterns"
                    ]
                ))
        
        # 4. General optimization recommendations
        total_cost = provider_breakdown.total_cost
        if total_cost > 1000:  # High total cost
            recommendations.append(OptimizationRecommendation(
                id="general_cost_monitoring",
                title="Implement Comprehensive Cost Monitoring",
                description="Given the high total costs, implement comprehensive cost monitoring and budget alerts.",
                recommendation_type=RecommendationType.ARCHITECTURE_CHANGE,
                priority=RecommendationPriority.MEDIUM,
                estimated_savings=total_cost * 0.10,  # Estimate 10% savings through better monitoring
                implementation_effort="Low",
                impact_score=6.0,
                related_metrics={
                    "total_monthly_cost": total_cost
                },
                action_items=[
                    "Set up cost budgets and alerts",
                    "Implement real-time cost tracking",
                    "Create cost optimization workflows",
                    "Regular cost review processes"
                ]
            ))
        
        # Sort by impact score and limit results
        recommendations.sort(key=lambda x: x.impact_score, reverse=True)
        return recommendations[:max_recommendations]
    
    def _calculate_trend(self, identifier: str, start_dt: datetime, end_dt: datetime, is_feature: bool = False) -> str:
        """Calculate trend for a provider or feature."""
        # Split the time period in half
        mid_point = start_dt + (end_dt - start_dt) / 2
        
        if is_feature:
            first_half = self.db.query(func.sum(CostRecord.cost)).filter(
                and_(
                    CostRecord.feature == identifier,
                    CostRecord.timestamp >= start_dt,
                    CostRecord.timestamp < mid_point
                )
            ).scalar() or 0
            
            second_half = self.db.query(func.sum(CostRecord.cost)).filter(
                and_(
                    CostRecord.feature == identifier,
                    CostRecord.timestamp >= mid_point,
                    CostRecord.timestamp <= end_dt
                )
            ).scalar() or 0
        else:
            first_half = self.db.query(func.sum(CostRecord.cost)).filter(
                and_(
                    CostRecord.provider == identifier,
                    CostRecord.timestamp >= start_dt,
                    CostRecord.timestamp < mid_point
                )
            ).scalar() or 0
            
            second_half = self.db.query(func.sum(CostRecord.cost)).filter(
                and_(
                    CostRecord.provider == identifier,
                    CostRecord.timestamp >= mid_point,
                    CostRecord.timestamp <= end_dt
                )
            ).scalar() or 0
        
        # Calculate trend
        if second_half > first_half * 1.1:
            return "increasing"
        elif second_half < first_half * 0.9:
            return "decreasing"
        else:
            return "stable"
    
    async def generate_sample_data(self, count: int = 1000):
        """Generate sample cost data for testing."""
        import random
        from datetime import timedelta
        
        providers = ["openai", "anthropic", "google", "aws", "azure", "stripe"]
        features = ["chat_completion", "text_embedding", "image_generation", "speech_to_text", "translation"]
        endpoints = ["/v1/chat/completions", "/v1/embeddings", "/v1/images/generations", "/v1/speech-to-text", "/v1/translations"]
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=30)
        
        for i in range(count):
            # Random timestamp within the last 30 days
            random_time = start_time + timedelta(seconds=random.randint(0, int((end_time - start_time).total_seconds())))
            
            provider = random.choice(providers)
            feature_idx = random.randint(0, len(features) - 1)
            feature = features[feature_idx]
            endpoint = endpoints[feature_idx]
            
            # Cost varies by provider and feature
            base_cost = {
                "openai": {"chat_completion": 0.002, "text_embedding": 0.0001, "image_generation": 0.020},
                "anthropic": {"chat_completion": 0.008, "text_embedding": 0.0001},
                "google": {"chat_completion": 0.001, "translation": 0.00002},
                "aws": {"speech_to_text": 0.006, "translation": 0.000015},
                "azure": {"speech_to_text": 0.006, "translation": 0.00001},
                "stripe": {"text_embedding": 0.0001}
            }
            
            cost_multiplier = base_cost.get(provider, {}).get(feature, 0.001)
            cost = cost_multiplier * random.uniform(0.5, 2.0) * random.randint(1, 10)
            
            cost_record = CostRecord(
                timestamp=random_time,
                provider=provider,
                feature=feature,
                endpoint=endpoint,
                cost=cost,
                response_time_ms=random.uniform(50, 2000),
                status_code=random.choice([200, 200, 200, 200, 400, 500]),  # Mostly successful
                request_size_bytes=random.randint(100, 5000),
                response_size_bytes=random.randint(500, 10000),
                user_id=f"user_{random.randint(1, 100)}",
                api_key_id=f"key_{random.randint(1, 50)}"
            )
            
            self.db.add(cost_record)
        
        self.db.commit()
        return f"Generated {count} sample cost records"