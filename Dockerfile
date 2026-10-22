FROM node:22 AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest-11 --activate

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

# Copy source files
COPY ./ /app

ARG VITE_SITE_ID
# only set the environment variable if the build arg was provided
ENV VITE_SITE_ID=${VITE_SITE_ID:-}

# node:22 and pnpm@latest-11 are floating tags: log what they resolved to
RUN echo "$(date) - node $(node --version), pnpm $(pnpm --version)" && \
    export $(cat /app/*.env | xargs) && \
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
