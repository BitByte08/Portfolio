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
uv sync
uv run uvicorn app.main:app --reload --port 8000
```
