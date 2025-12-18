# Cost Analytics Dashboard API

A comprehensive backend API for cost analytics dashboard with time-series data, cost breakdowns, anomaly detection, and optimization recommendations.

## Features

- **Cost Time Series**: Get total costs over time periods (daily/weekly/monthly)
- **Cost Breakdown**: Analyze costs by API provider and endpoint/feature
- **Anomaly Detection**: Identify unusual cost spikes using statistical methods
- **Optimization Recommendations**: AI-powered cost optimization suggestions
- **Flexible Querying**: Date ranges, filters, and multiple aggregation levels
- **Caching Layer**: Optimized performance with intelligent caching
- **Statistical Analysis**: Advanced cost aggregation and trend analysis

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Running the API

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### 1. Cost Time Series
```http
GET /api/v1/costs/time-series
```

Query parameters:
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `granularity`: Time granularity (daily/weekly/monthly)
- `provider`: Filter by API provider
- `feature`: Filter by endpoint/feature
- `limit`: Maximum data points (1-1000)

### 2. Cost Breakdown by Provider
```http
GET /api/v1/costs/breakdown/provider
```

### 3. Cost Breakdown by Feature
```http
GET /api/v1/costs/breakdown/feature
```

### 4. Cost Anomalies
```http
GET /api/v1/costs/anomalies
```

### 5. Optimization Recommendations
```http
GET /api/v1/costs/recommendations
```

### 6. Generate Sample Data
```http
POST /api/v1/costs/sample-data
```

## Sample Usage

### Get Daily Costs for Last 30 Days
```bash
curl "http://localhost:8000/api/v1/costs/time-series?granularity=daily"
```

### Get Costs by Provider
```bash
curl "http://localhost:8000/api/v1/costs/breakdown/provider?limit=5"
```

### Detect Anomalies
```bash
curl "http://localhost:8000/api/v1/costs/anomalies?sensitivity=2.0"
```

### Get Optimization Recommendations
```bash
curl "http://localhost:8000/api/v1/costs/recommendations?max_recommendations=5"
```

### Generate Sample Data
```bash
curl -X POST "http://localhost:8000/api/v1/costs/sample-data?count=1000"
```

## Database Schema

### CostRecord
- Individual API call cost records
- Tracks provider, feature, endpoint, cost, response time, etc.
- Indexed for optimal query performance

### CostAggregation
- Pre-aggregated cost data for faster queries
- Supports different time granularities
- Unique constraints prevent duplicate aggregations

## Architecture

### Services
- **AnalyticsService**: Core business logic for cost calculations
- **CachingService**: In-memory caching for performance optimization

### Utilities
- **QueryBuilder**: Flexible SQL query construction
- **AggregationUtils**: Statistical calculations and aggregations
- **DateUtils**: Date manipulation and formatting

### Caching Strategy
- Time series data: 5 minutes TTL
- Breakdown data: 10 minutes TTL
- Anomaly detection: 15 minutes TTL
- Recommendations: 30 minutes TTL

## Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string (default: sqlite:///./cost_analytics.db)
- `CACHE_TTL`: Default cache TTL in seconds (default: 300)

### Database
Uses SQLAlchemy with SQLite by default. Can be configured for PostgreSQL, MySQL, etc.

## Sample Data

The API includes a sample data generator that creates realistic cost records for testing:

- Multiple API providers (OpenAI, Anthropic, Google, AWS, Azure, Stripe)
- Various features (chat completion, embeddings, image generation, etc.)
- Realistic cost patterns and timing
- Configurable number of records

## Performance

### Optimization Features
- Database indexes on frequently queried columns
- Query result caching with TTL
- Efficient SQL aggregation queries
- Pagination support for large datasets
- Statistical analysis with minimal data transfer

### Scalability
- Horizontal scaling through stateless design
- Database connection pooling
- Async/await patterns for I/O operations
- Configurable caching strategies

## Development

### Project Structure
```
├── main.py                 # FastAPI application entry point
├── database.py             # Database models and configuration
├── schemas.py              # Pydantic models for API
├── services/               # Business logic services
│   ├── analytics_service.py
│   └── caching_service.py
├── utils/                  # Utility functions
│   ├── aggregation.py
│   ├── query_builder.py
│   └── date_utils.py
└── requirements.txt        # Python dependencies
```

### Testing
Use the sample data endpoint to generate test data, then test API endpoints through the interactive documentation or curl commands.

## API Response Examples

### Cost Time Series Response
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "granularity": "daily",
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00",
      "value": 125.50,
      "metadata": {
        "total_requests": 150,
        "avg_cost_per_request": 0.84
      }
    }
  ],
  "total_cost": 3890.25,
  "total_requests": 4650,
  "avg_cost_per_request": 0.84
}
```

### Anomaly Detection Response
```json
[
  {
    "id": "anomaly_20240115",
    "timestamp": "2024-01-15T00:00:00",
    "anomaly_type": "cost_spike",
    "severity": "high",
    "description": "Cost anomaly detected on 2024-01-15: $450.25 (expected: $125.50)",
    "cost_value": 450.25,
    "expected_value": 125.50,
    "deviation_percentage": 258.7
  }
]
```

## License

This project is created as a demonstration of cost analytics dashboard API capabilities.