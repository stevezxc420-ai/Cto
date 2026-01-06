# API Analytics & Cost Management Platform

A comprehensive platform for API analytics, cost management, and credential storage.

## Project Structure

- `src/` - Backend (Node.js/TypeScript) and Frontend (React/TypeScript) source code
- `public/` - Static assets for frontend
- `docs/` - Documentation
- Python Backend (FastAPI) - Specialized cost analytics service

## Features

- ✅ **React Frontend**: Modern dashboard with dark mode support
- ✅ **Node.js Backend**: User auth, API credential management, and integration framework
- ✅ **Python Analytics Service**: AI-powered cost analytics, anomaly detection, and optimization recommendations
- ✅ **Secure Credential Store**: AES-256-GCM encryption for API keys
- ✅ **Database Integration**: Support for PostgreSQL (Prisma/Sequelize) and SQLite

## Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm
- Docker (optional, for database)

### Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the application

#### Node.js Backend
```bash
npm run server:dev
```
Defaults to http://localhost:3000

#### Python Analytics API
```bash
python main.py
```
Defaults to http://localhost:8000

#### React Frontend
```bash
npm start
```
Defaults to http://localhost:3001

## Scripts

- `npm start` - Start frontend development server
- `npm run server:dev` - Start Node.js backend development server
- `npm run build` - Build frontend for production
- `npm run server:build` - Build Node.js backend (TypeScript)
- `npm test` - Run frontend tests
- `npm run server:db:migrate` - Run Prisma migrations
