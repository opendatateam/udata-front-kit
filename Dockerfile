FROM node:22 AS builder

WORKDIR /app

COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm install
RUN echo "$(date)" && \
    export $(cat /app/*.env | xargs) && \
    npm run build

FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
