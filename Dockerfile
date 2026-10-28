# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS build

WORKDIR /app

RUN npm install --global pnpm@12.6.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_API_DOCS_URL=/api/docs
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_DOCS_URL=${VITE_API_DOCS_URL}

RUN pnpm build

FROM nginx:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
