# 1. Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve stage
FROM nginx:alpine

# Remove default nginx static file config
RUN rm -rf /usr/share/nginx/html/*

# Copy build files to nginx server directory
COPY --from=build /app/build /usr/share/nginx/html

# Optional: custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
