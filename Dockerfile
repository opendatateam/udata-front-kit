FROM node:22 AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest-10 --activate

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install

# Copy source files
COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider

ARG VITE_SITE_ID
# only set the environment variable if the build arg was provided
ENV VITE_SITE_ID=${VITE_SITE_ID:-}

RUN echo "$(date)" && \
    export $(cat /app/*.env | xargs) && \
    pnpm run build

FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "public,max-age=0,must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf
