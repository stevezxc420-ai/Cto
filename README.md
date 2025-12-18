# MyApp Frontend (React + TypeScript)

Production-ready React 19 + TypeScript frontend with Tailwind CSS, routing, dark mode, and an Axios API client with JWT handling.

## Prerequisites

- Node.js 16+ (recommended 18+)
- npm (comes with Node)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

3. Start the dev server:

```bash
npm start
```

Open http://localhost:3000

## Environment variables

Create React App only exposes variables prefixed with `REACT_APP_`.

| Variable | Required | Default | Description |
|---|---:|---|---|
| `REACT_APP_API_URL` | no | `http://localhost:8000/api` | Backend API base URL |
| `REACT_APP_API_TIMEOUT` | no | `10000` | Axios request timeout (ms) |
| `REACT_APP_TOKEN_KEY` | no | `auth_token` | localStorage key for persisted auth |
| `REACT_APP_APP_NAME` | no | `MyApp` | Display name |
| `REACT_APP_VERSION` | no | `1.0.0` | Display version |

## Scripts

- `npm start` - start dev server
- `npm test` - run unit tests
- `npm run build` - production build

## API documentation

See [`docs/API.md`](./docs/API.md) for the endpoints and payloads expected by the frontend.

## Security notes

- Do not commit `.env` / `.env.local` files with real secrets.
- JWT expiration is checked locally (via `expiresAt` or JWT `exp`) and also handled on `401` responses.
- React escapes rendered values by default; avoid using `dangerouslySetInnerHTML` with untrusted content.
