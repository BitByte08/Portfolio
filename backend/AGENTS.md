# BACKEND KNOWLEDGE BASE

**Generated:** 2026-07-02
**Commit:** n/a
**Branch:** n/a

## OVERVIEW
This package is a small NestJS API that mirrors portfolio data from `../content/portfolio.json`. It is intentionally thin: bootstrap, routes, and file-backed data loading.

## STRUCTURE
```
backend/
  src/      # Nest bootstrap, controller, DTO, portfolio loader
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change route behavior | `src/app.controller.ts` | `/health`, `/portfolio`, `/contact`. |
| Change startup or CORS | `src/main.ts` | Bootstraps Nest and listens on `PORT`. |
| Change portfolio loading | `src/portfolio.service.ts` | Reads the shared JSON from the repo root. |
| Change contact payload shape | `src/contact.dto.ts` | Keep it aligned with the controller. |

## CONVENTIONS
- Keep the API response shape aligned with the shared content file and the frontend fallback.
- Preserve the lightweight bootstrap. No extra framework plumbing unless it serves a visible feature.
- Read-only file loading is the default; avoid adding writable state to the service layer.

## ANTI-PATTERNS (THIS PROJECT)
- Do not hardcode portfolio content here if the same data already lives in `content/portfolio.json`.
- Do not widen `/contact` into an implementation detail dump; it should stay a simple acknowledgement path.
- Do not add build artifacts or dependency output under this directory.

## COMMANDS
```bash
npm run start:dev
npm run build
npm run start
```

## NOTES
- The backend assumes the repo root layout, so moving `content/portfolio.json` requires a corresponding loader update.
