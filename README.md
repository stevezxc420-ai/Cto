# Authentication System

A complete authentication system with JWT tokens, bcrypt password hashing, and PostgreSQL storage.

## Features

- User registration with email validation
- User login with JWT access tokens
- Refresh token mechanism for token rotation
- Password hashing with bcrypt
- Protected route middleware
- Error handling for auth failures
- PostgreSQL database integration

## Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/auth_db
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
```

4. Create the database:
```bash
psql -U postgres -c "CREATE DATABASE auth_db;"
```

5. Run migrations:
```bash
npm run migrate
```

6. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response:
```json
{
  "message": "Tokens refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "message": "Logout successful"
}
```

### Protected Routes

#### Get User Profile
```
GET /api/protected/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request` - Missing or invalid request parameters
- `401 Unauthorized` - Invalid credentials or expired tokens
- `403 Forbidden` - Invalid or revoked tokens
- `409 Conflict` - Email already registered
- `500 Internal Server Error` - Server errors

## Security

- Passwords are hashed using bcrypt with 10 rounds
- JWT tokens have expiration times
- Refresh tokens are stored securely in the database
- Tokens are verified on protected routes
- Email validation is performed during registration
