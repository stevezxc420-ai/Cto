# Testing Guide for Authentication System

## Prerequisites

1. Ensure PostgreSQL is running
2. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE auth_db;"
   ```
3. Run migrations:
   ```bash
   npm run migrate
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:3000`

## Testing with cURL

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "test@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Login with Valid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response: Same structure as registration

### 4. Login with Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

Expected response (401):
```json
{
  "error": "Invalid email or password"
}
```

### 5. Access Protected Route with Valid Token
Save the `accessToken` from registration/login, then:

```bash
curl http://localhost:3000/api/protected/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected response:
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Access Protected Route Without Token
```bash
curl http://localhost:3000/api/protected/me
```

Expected response (401):
```json
{
  "error": "Access token required"
}
```

### 7. Refresh Token
Save the `refreshToken` from registration/login, then:

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

Expected response:
```json
{
  "message": "Tokens refreshed successfully",
  "accessToken": "NEW_ACCESS_TOKEN...",
  "refreshToken": "NEW_REFRESH_TOKEN..."
}
```

### 8. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected response:
```json
{
  "message": "Logout successful"
}
```

## Validation Tests

### Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'
```

Expected response (400):
```json
{
  "error": "Invalid email format"
}
```

### Password Too Short
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "short"
  }'
```

Expected response (400):
```json
{
  "error": "Password must be at least 6 characters"
}
```

### Duplicate Email
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

(After registering the first time)

Expected response (409):
```json
{
  "error": "Email already registered"
}
```

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

Expected response (400):
```json
{
  "error": "Email and password are required"
}
```

## Manual Acceptance Criteria Check

- [x] Can register with email/password
- [x] Can login with valid credentials
- [x] Receives JWT access token on login
- [x] Can access protected endpoints with JWT token
- [x] Receives error without valid token
- [x] Can refresh tokens using refresh token
- [x] Can logout (clears refresh token)
- [x] Password is hashed with bcrypt
- [x] Email validation is performed
- [x] Proper error handling for auth failures
- [x] Data persisted in PostgreSQL
