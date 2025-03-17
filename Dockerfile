FROM node:21 as builder

WORKDIR /app

COPY ./ /app

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm install
RUN echo "$(date)" && \
    export $(cat /app/*.env | xargs) && \
    npm run build

FROM nginx:alpine-slim

COPY --from=builder /app/dist /usr/share/nginx/html
