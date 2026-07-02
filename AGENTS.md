# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-02
**Commit:** n/a
**Branch:** n/a

## OVERVIEW
This repo is a personal portfolio built as a Next.js 16 frontend with a small NestJS backend mirror. The frontend is the primary surface; the backend exists to serve portfolio data and contact/health endpoints.

## STRUCTURE
```
portfolio/
  app/         # App Router pages, layout, metadata, global styles
  components/  # Reusable UI sections and the project modal/markdown viewer
  content/     # Canonical portfolio JSON consumed by both apps
  docs/        # Design notes and visual direction
  fonts/       # Local Pretendard font asset
  public/      # Social image, favicon, Cloudflare headers
  backend/     # Separate NestJS package and API entrypoints
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change the home page layout or metadata | `app/page.tsx`, `app/layout.tsx` | `generateMetadata()` pulls from `lib/portfolio.ts`. |
| Change shared portfolio content | `content/portfolio.json` | Treat as source of truth for both apps. |
| Adjust project card/modal behavior | `components/projects-section.tsx` | Client component; Escape closes the modal. |
| Adjust markdown rendering | `components/markdown-viewer.tsx` | Tiny custom parser, not a library wrapper. |
| Change backend API responses | `backend/src/app.controller.ts`, `backend/src/portfolio.service.ts` | `/health`, `/portfolio`, `/contact`. |
| Change backend bootstrap or port/CORS | `backend/src/main.ts` | Listens on `PORT` or `8000`. |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `Home` | function | `app/page.tsx` | 0 | Main portfolio page composition. |
| `generateMetadata` | function | `app/page.tsx` | 0 | SEO metadata from portfolio data. |
| `getPortfolioData` | function | `lib/portfolio.ts` | 1 | Frontend data fetch with backend fallback. |
| `ProjectsSection` | component | `components/projects-section.tsx` | 1 | Client-side project grid and modal. |
| `MarkdownViewer` | component | `components/markdown-viewer.tsx` | 1 | Lightweight markdown renderer for project details. |
| `PortfolioService` | class | `backend/src/portfolio.service.ts` | 1 | Backend loader for `content/portfolio.json`. |
| `AppController` | class | `backend/src/app.controller.ts` | 0 | API routes for health, portfolio, contact. |

## CONVENTIONS
- `content/portfolio.json` is the canonical content payload; keep frontend and backend shapes aligned with it.
- `ProjectsSection` is client-only because it owns modal state and keyboard handling.
- Local Pretendard font stays in `app/layout.tsx`; do not swap to a CDN font without a deliberate design change.
- `PORTFOLIO_BACKEND_URL` is optional; the frontend must still work when the backend is unavailable.

## ANTI-PATTERNS (THIS PROJECT)
- Do not edit generated output in `.next/`, `backend/dist/`, or dependency trees.
- Do not duplicate portfolio copy across page components when `content/portfolio.json` already owns it.
- Do not move client-only modal logic into server components.
- Do not change backend response shapes without updating the shared content contract.

## UNIQUE STYLES
- The projects section uses a modal plus markdown preview instead of a separate detail page.
- The site leans on local assets and inline content data rather than a CMS.
- The backend is a thin adapter, not a second source of truth.

## COMMANDS
```bash
npm run dev
npm run build
npm run start
npm run preview
cd backend
npm run start:dev
npm run build
```

## NOTES
- `docs/DESIGN.md` captures presentation intent; check it before making visible UI changes.
- `public/_headers` and `wrangler.jsonc` matter for Cloudflare deployment behavior.
