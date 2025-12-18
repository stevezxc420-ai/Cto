# API Endpoints (expected by the frontend)

This frontend is API-driven but can fall back to local mock data when the backend is unavailable.

Base URL: `REACT_APP_API_URL` (defaults to `http://localhost:8000/api`).

## Auth

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

Response:

```json
{
  "token": "<jwt>",
  "refreshToken": "<optional>",
  "expiresAt": 1735689600000
}
```

Notes:
- `expiresAt` is epoch milliseconds. If omitted, the frontend will attempt to read the JWT `exp` claim.

## Dashboard

### `GET /dashboard/stats`

Response:

```json
{
  "totalUsers": 1234,
  "totalRevenue": 12345,
  "monthlyGrowth": 12.5,
  "issues": 23
}
```

## Users

### `GET /users`

Response:

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "status": "Active",
    "lastLogin": "2024-12-17"
  }
]
```

## Settings

### `GET /settings`

Response:

```json
{
  "notifications": true,
  "emailAlerts": false,
  "theme": "light",
  "language": "en",
  "timezone": "UTC"
}
```
