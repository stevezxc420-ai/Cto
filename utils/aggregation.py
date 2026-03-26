from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
import statistics
import numpy as np
from sqlalchemy import func
from database import CostRecord

class AggregationUtils:
    """Utility functions for cost aggregation and calculations."""
    
    @staticmethod
    def calculate_percentile(values: List[float], percentile: float) -> float:
        """Calculate percentile from a list of values."""
        if not values:
            return 0.0
        
        sorted_values = sorted(values)
        index = (percentile / 100.0) * (len(sorted_values) - 1)
        
        if index.is_integer():
            return sorted_values[int(index)]
        else:
            lower_index = int(index)
            upper_index = min(lower_index + 1, len(sorted_values) - 1)
            weight = index - lower_index
            
            return sorted_values[lower_index] * (1 - weight) + sorted_values[upper_index] * weight
    
    @staticmethod
    def calculate_growth_rate(current_value: float, previous_value: float) -> float:
        """Calculate growth rate between two values."""
        if previous_value == 0:
            return 100.0 if current_value > 0 else 0.0
        
        return ((current_value - previous_value) / previous_value) * 100
    
    @staticmethod
    def calculate_trend(values: List[float]) -> str:
        """Calculate trend direction from a series of values."""
        if len(values) < 3:
            return "stable"
        
        # Simple linear regression to determine trend
        x = list(range(len(values)))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.01:
            return "increasing"
        elif slope < -0.01:
            return "decreasing"
        else:
            return "stable"
    
    @staticmethod
    def group_by_period(records: List[CostRecord], period: str) -> Dict[str, Dict[str, Any]]:
        """Group cost records by time period."""
        grouped = {}
        
        for record in records:
            if period == "daily":
                key = record.timestamp.strftime("%Y-%m-%d")
            elif period == "weekly":
                # ISO week format
                year, week, _ = record.timestamp.isocalendar()
                key = f"{year}-W{week:02d}"
            elif period == "monthly":
                key = record.timestamp.strftime("%Y-%m")
            else:
                key = record.timestamp.strftime("%Y-%m-%d")
            
            if key not in grouped:
                grouped[key] = {
                    "total_cost": 0.0,
                    "total_requests": 0,
                    "costs": [],
                    "response_times": []
                }
            
            grouped[key]["total_cost"] += record.cost
            grouped[key]["total_requests"] += 1
            grouped[key]["costs"].append(record.cost)
            
            if record.response_time_ms:
                grouped[key]["response_times"].append(record.response_time_ms)
        
        # Calculate additional metrics
        for period_data in grouped.values():
            costs = period_data["costs"]
            period_data["avg_cost"] = statistics.mean(costs) if costs else 0
            period_data["median_cost"] = statistics.median(costs) if costs else 0
            period_data["p95_cost"] = AggregationUtils.calculate_percentile(costs, 95)
            
            response_times = period_data["response_times"]
            period_data["avg_response_time"] = statistics.mean(response_times) if response_times else 0
            period_data["p95_response_time"] = AggregationUtils.calculate_percentile(response_times, 95) if response_times else 0
            
            # Calculate success rate
            period_data["success_rate"] = 100.0  # Would need status_code data to calculate properly
        
        return grouped
    
    @staticmethod
    def aggregate_by_dimension(records: List[CostRecord], dimension: str) -> Dict[str, Dict[str, Any]]:
        """Aggregate cost records by a specific dimension (provider, feature, etc.)."""
        aggregated = {}
        
        for record in records:
            if dimension == "provider":
                key = record.provider
            elif dimension == "feature":
                key = record.feature
            elif dimension == "endpoint":
                key = record.endpoint
            elif dimension == "user":
                key = record.user_id or "unknown"
            else:
                continue
            
            if key not in aggregated:
                aggregated[key] = {
                    "total_cost": 0.0,
                    "total_requests": 0,
                    "costs": [],
                    "unique_endpoints": set(),
                    "time_span_start": record.timestamp,
                    "time_span_end": record.timestamp
                }
            
            aggregated[key]["total_cost"] += record.cost
            aggregated[key]["total_requests"] += 1
            aggregated[key]["costs"].append(record.cost)
            aggregated[key]["unique_endpoints"].add(record.endpoint)
            
            # Update time span
            if record.timestamp < aggregated[key]["time_span_start"]:
                aggregated[key]["time_span_start"] = record.timestamp
            if record.timestamp > aggregated[key]["time_span_end"]:
                aggregated[key]["time_span_end"] = record.timestamp
        
        # Calculate additional metrics
        for dimension_data in aggregated.values():
            costs = dimension_data["costs"]
            dimension_data["avg_cost"] = statistics.mean(costs) if costs else 0
            dimension_data["median_cost"] = statistics.median(costs) if costs else 0
            dimension_data["p95_cost"] = AggregationUtils.calculate_percentile(costs, 95)
            dimension_data["unique_endpoint_count"] = len(dimension_data["unique_endpoints"])
            
            # Calculate cost per day
            time_span = (dimension_data["time_span_end"] - dimension_data["time_span_start"]).days + 1
            dimension_data["cost_per_day"] = dimension_data["total_cost"] / time_span if time_span > 0 else 0
            
            # Remove the set from the final output (not JSON serializable)
            del dimension_data["unique_endpoints"]
        
        return aggregated
    
    @staticmethod
    def detect_outliers(values: List[float], method: str = "iqr", threshold: float = 1.5) -> List[int]:
        """Detect outliers in a list of values."""
        if len(values) < 4:
            return []
        
        outliers = []
        
        if method == "iqr":
            # Interquartile Range method
            q1 = AggregationUtils.calculate_percentile(values, 25)
            q3 = AggregationUtils.calculate_percentile(values, 75)
            iqr = q3 - q1
            
            lower_bound = q1 - threshold * iqr
            upper_bound = q3 + threshold * iqr
            
            for i, value in enumerate(values):
                if value < lower_bound or value > upper_bound:
                    outliers.append(i)
        
        elif method == "zscore":
            # Z-score method
            mean_val = statistics.mean(values)
            std_dev = statistics.stdev(values) if len(values) > 1 else 0
            
            if std_dev > 0:
                for i, value in enumerate(values):
                    z_score = abs((value - mean_val) / std_dev)
                    if z_score > threshold:
                        outliers.append(i)
        
        return outliers
    
    @staticmethod
    def calculate_cost_efficiency_metrics(total_cost: float, total_requests: int, 
                                        avg_response_time: float, success_rate: float) -> Dict[str, float]:
        """Calculate cost efficiency metrics."""
        metrics = {}
        
        # Cost per request
        metrics["cost_per_request"] = total_cost / total_requests if total_requests > 0 else 0
        
        # Cost efficiency score (lower is better)
        # Normalize response time to 0-100 scale (assuming 1000ms is poor, 100ms is excellent)
        response_time_score = max(0, 100 - (avg_response_time / 10)) if avg_response_time else 50
        
        # Success rate score
        success_score = success_rate if success_rate else 90
        
        # Combined efficiency score (0-100, higher is better)
        metrics["cost_efficiency_score"] = (response_time_score * 0.3 + success_score * 0.7)
        
        # Cost per millisecond of response time
        metrics["cost_per_ms"] = metrics["cost_per_request"] / avg_response_time if avg_response_time > 0 else 0
        
        return metrics
    
    @staticmethod
    def normalize_time_series(data: List[Dict[str, Any]], target_period: str = "daily") -> List[Dict[str, Any]]:
        """Normalize time series data to a target period."""
        if not data:
            return []
        
        # This would involve resampling and interpolation
        # Implementation depends on specific requirements
        # For now, return the original data
        return data