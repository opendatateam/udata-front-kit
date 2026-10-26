FROM node:22 AS builder

# Install pnpm, pinned by "packageManager" in package.json
RUN corepack enable

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

# Copy source files
COPY ./ /app

ARG VITE_SITE_ID
RUN test -n "$VITE_SITE_ID" || { echo "VITE_SITE_ID build arg is required" >&2; exit 1; }

# node base image is a floating tag: log what it resolved to, and the pnpm in use
RUN echo "$(date) - node $(node --version), pnpm $(pnpm --version)" && \
    pnpm run build

FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html

# alpine-slim is a floating tag: log what it resolved to
RUN nginx -v && echo "alpine $(cat /etc/alpine-release)"

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "public,max-age=0,must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf
