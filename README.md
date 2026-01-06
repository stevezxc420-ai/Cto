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
