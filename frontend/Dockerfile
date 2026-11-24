# syntax=docker/dockerfile:1.7

# ---- Build stage: compile the static bundle ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Optional build-time default; the runtime API_BASE_URL (config.js) takes precedence.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Runtime stage: static files behind nginx ----
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# The nginx image runs everything in /docker-entrypoint.d/ before starting.
COPY docker-entrypoint.sh /docker-entrypoint.d/40-chatter-config.sh
RUN chmod +x /docker-entrypoint.d/40-chatter-config.sh

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
