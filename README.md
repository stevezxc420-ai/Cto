# API Analytics Platform

## Local development (Docker)

```bash
docker compose up --build
```

- API: http://localhost:3000
- Health: http://localhost:3000/health
- Postgres: localhost:5432 (user/password: `postgres` / `postgres`, db: `api_analytics`)

## Local development (host)

1. Start Postgres (e.g. via `docker compose up db`)
2. Ensure `.env` has `DATABASE_URL` pointing at `localhost`
3. Install deps and run:

```bash
npm install
npm run dev
```

## Endpoints

- `GET /health` → 200 when API is up and DB query succeeds
- `GET /api/me` → protected route (requires `Authorization: Bearer <jwt>`)
