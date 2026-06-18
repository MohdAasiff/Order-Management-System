# frontend/Dockerfile
# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage (Using Nginx to serve the compiled React app)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# FAANG Standard: React Router fallback config for Nginx
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]