FROM oven/bun:1 AS build

WORKDIR /app

# context is at root folder not frontend
COPY ./frontend/package.json ./frontend/bun.lock* ./
COPY ./frontend ./frontend
COPY ./backend ./backend
WORKDIR /app/frontend
RUN bun install --frozen-lockfile

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build

FROM nginx:alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
