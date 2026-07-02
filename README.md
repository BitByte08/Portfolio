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

Set `PORTFOLIO_ADMIN_TOKEN` to protect the admin routes and `CLOUDFLARE_TUNNEL_TOKEN` to your named tunnel token.
In Cloudflare, point the tunnel hostname at `http://backend:8000`.
