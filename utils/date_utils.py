from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import calendar

class DateUtils:
    """Utility functions for date manipulation and formatting."""
    
    @staticmethod
    def parse_date_string(date_str: str, date_format: str = "%Y-%m-%d") -> datetime:
        """Parse a date string into a datetime object."""
        try:
            return datetime.strptime(date_str, date_format)
        except ValueError as e:
            raise ValueError(f"Invalid date format: {date_str}. Expected format: {date_format}") from e
    
    @staticmethod
    def format_date(date_obj: datetime, date_format: str = "%Y-%m-%d") -> str:
        """Format a datetime object into a string."""
        return date_obj.strftime(date_format)
    
    @staticmethod
    def get_date_range(start_date: Optional[str] = None, end_date: Optional[str] = None, 
                      default_days: int = 30) -> tuple[datetime, datetime]:
        """Get a date range with sensible defaults."""
        if not start_date and not end_date:
            # Default to last N days
            end_dt = datetime.utcnow()
            start_dt = end_dt - timedelta(days=default_days)
            return start_dt, end_dt
        
        if not start_date:
            # If only end_date provided, go back default_days from it
            end_dt = DateUtils.parse_date_string(end_date)
            start_dt = end_dt - timedelta(days=default_days)
            return start_dt, end_dt
        
        if not end_date:
            # If only start_date provided, go forward default_days from it
            start_dt = DateUtils.parse_date_string(start_date)
            end_dt = start_dt + timedelta(days=default_days)
            return start_dt, end_dt
        
        # Both provided
        start_dt = DateUtils.parse_date_string(start_date)
        end_dt = DateUtils.parse_date_string(end_date)
        
        if start_dt > end_dt:
            raise ValueError("Start date cannot be after end date")
        
        return start_dt, end_dt
    
    @staticmethod
    def get_granularity_dates(granularity: str, start_date: datetime, end_date: datetime) -> List[datetime]:
        """Get a list of dates for the specified granularity."""
        dates = []
        current = start_date
        
        while current <= end_date:
            dates.append(current)
            
            if granularity == "daily":
                current += timedelta(days=1)
            elif granularity == "weekly":
                current += timedelta(weeks=1)
            elif granularity == "monthly":
                # Move to next month
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1, day=1)
                else:
                    current = current.replace(month=current.month + 1, day=1)
            else:
                current += timedelta(days=1)
        
        return dates
    
    @staticmethod
    def get_period_start_end(date: datetime, granularity: str) -> tuple[datetime, datetime]:
        """Get the start and end of a period for a given date and granularity."""
        if granularity == "daily":
            start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1) - timedelta(microseconds=1)
        elif granularity == "weekly":
            # ISO week starts on Monday
            days_since_monday = date.weekday()
            start = date - timedelta(days=days_since_monday)
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=7) - timedelta(microseconds=1)
        elif granularity == "monthly":
            start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # Get last day of month
            if date.month == 12:
                next_month = date.replace(year=date.year + 1, month=1, day=1)
            else:
                next_month = date.replace(month=date.month + 1, day=1)
            end = next_month - timedelta(microseconds=1)
        else:
            start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1) - timedelta(microseconds=1)
        
        return start, end
    
    @staticmethod
    def is_business_hours(date: datetime, business_start: int = 9, business_end: int = 17) -> bool:
        """Check if a datetime is within business hours."""
        return business_start <= date.hour < business_end
    
    @staticmethod
    def is_weekend(date: datetime) -> bool:
        """Check if a datetime is on a weekend (Saturday or Sunday)."""
        return date.weekday() >= 5  # Monday=0, Sunday=6
    
    @staticmethod
    def get_timezone_aware_now() -> datetime:
        """Get current datetime in UTC."""
        return datetime.utcnow()
    
    @staticmethod
    def add_business_days(start_date: datetime, business_days: int) -> datetime:
        """Add a number of business days to a start date."""
        current = start_date
        days_added = 0
        
        while days_added < business_days:
            current += timedelta(days=1)
            if not DateUtils.is_weekend(current):
                days_added += 1
        
        return current
    
    @staticmethod
    def get_days_in_month(year: int, month: int) -> int:
        """Get number of days in a month."""
        return calendar.monthrange(year, month)[1]
    
    @staticmethod
    def get_week_number(date: datetime) -> int:
        """Get ISO week number for a date."""
        return date.isocalendar()[1]
    
    @staticmethod
    def get_quarter(date: datetime) -> int:
        """Get quarter (1-4) for a date."""
        return (date.month - 1) // 3 + 1
    
    @staticmethod
    def get_quarter_dates(date: datetime) -> tuple[datetime, datetime]:
        """Get start and end dates for the quarter containing the given date."""
        quarter = DateUtils.get_quarter(date)
        quarter_start_month = (quarter - 1) * 3 + 1
        
        start = date.replace(
            month=quarter_start_month, 
            day=1, 
            hour=0, minute=0, second=0, microsecond=0
        )
        
        if quarter == 4:
            quarter_end_month = 1
            quarter_end_year = date.year + 1
        else:
            quarter_end_month = quarter * 3 + 1
            quarter_end_year = date.year
        
        end_month_start = DateUtils.get_quarter_dates(
            datetime(quarter_end_year, quarter_end_month, 1)
        )[1]
        
        end = end_month_start - timedelta(microseconds=1)
        
        return start, end
    
    @staticmethod
    def format_duration(seconds: float) -> str:
        """Format a duration in seconds to a human-readable string."""
        if seconds < 60:
            return f"{seconds:.1f} seconds"
        elif seconds < 3600:
            minutes = seconds / 60
            return f"{minutes:.1f} minutes"
        elif seconds < 86400:
            hours = seconds / 3600
            return f"{hours:.1f} hours"
        else:
            days = seconds / 86400
            return f"{days:.1f} days"
    
    @staticmethod
    def calculate_time_difference(start: datetime, end: datetime) -> Dict[str, int]:
        """Calculate time difference between two datetimes."""
        diff = end - start
        
        days = diff.days
        seconds = diff.seconds
        microseconds = diff.microseconds
        
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        return {
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "seconds": secs,
            "microseconds": microseconds,
            "total_seconds": diff.total_seconds()
        }