# Portfolio

Next.js portfolio site configured for Cloudflare Workers via OpenNext, with a small NestJS backend boundary for shared content and contact handling.

## Run locally

```bash
npm install
npm run dev
```

## Build for Cloudflare

```bash
npm run build
npm run preview
```

## Backend

```bash
cd backend
npm install
npm run start:dev
```

## Docker deployment

The backend can be deployed with Docker Compose and exposed through a Cloudflare Tunnel.

```bash
cp .env.example .env
docker compose up --build -d
```

Set `PORTFOLIO_WEB_ORIGIN` to the frontend origin, `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUDIENCE` to match your Cloudflare Access app, and `CF_ACCESS_ALLOWED_EMAILS` to the admin email allowlist.
`PORTFOLIO_ADMIN_TOKEN` stays available only as a localhost fallback; production admin access should come from Cloudflare Access.
In Cloudflare, point the tunnel hostname at `http://backend:8000`, then protect the admin hostname or path with Access.

## CI/CD and Oracle VM

The end-to-end deployment flow is documented in [`docs/deployment.md`](docs/deployment.md).
