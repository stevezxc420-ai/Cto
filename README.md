<<<<<<< HEAD
# API Analytics Platform

Full-stack platform with a React frontend and Node.js Express backend.

## Project Structure

- `src/` - Backend and Frontend source code
- `public/` - Static assets for frontend
- `docs/` - Documentation

## Setup

### Prerequisites

- Node.js 18+
- npm
- Docker (optional, for database)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the application

#### Backend
```bash
npm run server:dev
```
Defaults to http://localhost:3000

#### Frontend
```bash
npm start
```
Defaults to http://localhost:3001 (if 3000 is taken by backend)

### Scripts

- `npm start` - Start frontend development server
- `npm run server:dev` - Start backend development server
- `npm run build` - Build frontend for production
- `npm run server:build` - Build backend (TypeScript)
- `npm test` - Run frontend tests
- `npm run typecheck` - Run backend type checks
=======
# API Credentials Manager

A secure system for managing external API credentials with encryption at rest.

## Features

- ✅ Securely store API credentials for multiple providers (Stripe, Twilio, SendGrid, AWS, Slack)
- ✅ AES-256-GCM encryption for API keys at rest
- ✅ Provider-specific API key validation
- ✅ Masked key display (never expose full keys in responses)
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful API endpoints

## Supported Providers

- **Stripe**: Payment processing API keys
- **Twilio**: SMS and communication API keys
- **SendGrid**: Email delivery API keys
- **AWS**: Amazon Web Services access keys
- **Slack**: Workspace integration tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and encryption key
```

3. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Add API Credential
```http
POST /api/credentials
Content-Type: application/json

{
  "userId": "user123",
  "provider": "stripe",
  "apiKey": "sk_test_XXXXXXXXXXXXXXXXXXXXX",
  "keyName": "Production Stripe Key" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user123",
    "provider": "stripe",
    "keyName": "Production Stripe Key",
    "maskedKey": "sk_t************klmn",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### List User's Credentials
```http
GET /api/credentials/:userId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user123",
      "provider": "stripe",
      "maskedKey": "sk_t************klmn",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Credential
```http
GET /api/credentials/:userId/:id
```

### Delete Credential
```http
DELETE /api/credentials/:userId/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Credential deleted successfully"
}
```

## Security Features

### Encryption
- Uses AES-256-GCM encryption algorithm
- Unique IV (Initialization Vector) for each encrypted value
- Authentication tags for integrity verification
- Encryption key derived using scrypt

### Key Masking
API keys are never returned in full. The system shows only the first and last 4 characters:
- Example: `sk_test_XXXXXXXXXXXXXXXXXXXXX` → `sk_t************XXXX`

### Validation
Each provider has specific validation rules:
- **Stripe**: Must start with `sk_test_`, `sk_live_`, `rk_test_`, or `rk_live_`
- **Twilio**: Must start with `SK` or `AC` followed by 32 hex characters
- **SendGrid**: Must match format `SG.{22chars}.{43chars}`
- **AWS**: Must start with `AKIA` followed by 16 alphanumeric characters
- **Slack**: Must start with `xoxb-`, `xoxa-`, `xoxp-`, `xoxr-`, or `xoxs-`

## Database Schema

```prisma
model Credential {
  id            String   @id @default(uuid())
  userId        String
  provider      String
  encryptedKey  String
  keyName       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, provider, keyName])
  @@index([userId])
}
```

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `ENCRYPTION_KEY`: 32+ character encryption key (keep secret!)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
>>>>>>> origin/feat-api-credentials-secure-store
