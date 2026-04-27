# ── deps: install all workspace deps ───────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/server/package.json  ./packages/server/
RUN npm ci --ignore-scripts

# ── build: compile shared then server ──────────────────────────────────────
FROM deps AS build
COPY packages/shared ./packages/shared
RUN npm run build -w packages/shared

COPY packages/server ./packages/server
RUN npm run build -w packages/server

# ── runtime: lean production image ─────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json            ./
COPY --from=build /app/node_modules            ./node_modules
COPY --from=build /app/packages/shared/dist    ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/server/dist    ./packages/server/dist
COPY --from=build /app/packages/server/package.json ./packages/server/
# schema.sql is applied via docker-compose init script, not at runtime
COPY packages/server/src/schema.sql ./schema.sql

EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
