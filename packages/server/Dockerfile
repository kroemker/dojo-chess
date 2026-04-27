# ── deps: install all workspace deps ───────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/server/package.json  ./packages/server/
RUN npm ci --ignore-scripts

# ── build: compile shared then server ──────────────────────────────────────
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
RUN npm run build -w packages/shared

COPY packages/server ./packages/server
RUN npm run build -w packages/server

# ── runtime: lean production image ─────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Re-run npm ci (prod only) so npm creates workspace symlinks itself —
# avoids the broken-symlink problem of copying node_modules between stages.
COPY package.json package-lock.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/server/package.json  ./packages/server/
RUN npm ci --omit=dev --ignore-scripts

# Overlay compiled output; symlink targets now have what they need.
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/server/dist ./packages/server/dist

EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
