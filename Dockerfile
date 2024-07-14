# Stage 1: Build
FROM node:20 AS build

# Cara ke-1
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Cara ke-2
# WORKDIR /app
# COPY dist/* .

# Stage 2: Serve
FROM nginx:alpine

# Cara ke-1
COPY --from=build /app/dist /usr/share/nginx/html

# Cara ke-2
# COPY --from=build /app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80