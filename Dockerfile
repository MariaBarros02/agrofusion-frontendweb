# ETAPA 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ETAPA 2: Servir con Nginx en puerto 3000
FROM nginx:alpine

# Copiamos los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para SPA con subcarpeta
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location /agrofusion { \
        alias /usr/share/nginx/html; \
        try_files $uri $uri/ /agrofusion/index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# EXPONEMOS EL PUERTO 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
