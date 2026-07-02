FROM node:22-bookworm-slim AS deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

FROM deps AS build
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src
COPY backend/data/schema.sql ./data/schema.sql
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8000
ENV PORTFOLIO_DB_PATH=/var/lib/portfolio/portfolio.sqlite

COPY --from=build /app/backend/package*.json ./
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/data/schema.sql ./data/schema.sql
COPY content /app/content

RUN mkdir -p /var/lib/portfolio

EXPOSE 8000

CMD ["node", "dist/main.js"]
