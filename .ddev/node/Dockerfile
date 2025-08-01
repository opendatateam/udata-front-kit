FROM node:21

RUN apt-get update && apt-get install -y \
  git \
  curl \
  vim \
  bash-completion \
  && apt-get clean

WORKDIR /var/www/html
