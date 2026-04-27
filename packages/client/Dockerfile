# ── deps: install all workspace deps ───────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/client/package.json  ./packages/client/
RUN npm ci --ignore-scripts

# ── build: compile shared, then Vite build the client ──────────────────────
FROM deps AS build
COPY packages/shared ./packages/shared
RUN npm run build -w packages/shared

COPY packages/client ./packages/client
RUN npm run build -w packages/client

# ── runtime: nginx serving static assets ───────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
