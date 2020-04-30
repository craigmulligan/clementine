FROM node:12.16.3-alpine3.11

ARG NODE_ENV=production

ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm install --no-optional && npm cache clean --force

COPY . .
