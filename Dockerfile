FROM node:22 AS builder

WORKDIR /app

COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider

ARG VITE_SIDE_ID
# only set the environment variable if the build arg was provided
ENV VITE_SIDE_ID=${VITE_SIDE_ID:-}

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
        add_header Cache-Control "public,max-age=0,must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf
