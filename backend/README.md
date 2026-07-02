# Backend

NestJS service that exposes the shared portfolio payload, admin write endpoints, and a simple contact endpoint.

## Run

```bash
cd backend
npm install
npm run start:dev
```

## Docker

The backend image is built from [`backend/Dockerfile`](../backend/Dockerfile) and stores the portfolio database at `/var/lib/portfolio/portfolio.sqlite`.
When run through [`compose.yml`](../compose.yml), set `PORTFOLIO_WEB_ORIGIN`, `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUDIENCE`, and `CF_ACCESS_ALLOWED_EMAILS` in `.env`.
`PORTFOLIO_ADMIN_TOKEN` is only used for localhost fallback during development.
