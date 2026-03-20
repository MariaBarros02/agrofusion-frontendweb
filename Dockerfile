# ETAPA 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

#  Usa el nuevo comando de build
RUN npm run build:prod

# ETAPA 2: Servir con Nginx en puerto 3000
FROM nginx:alpine

RUN mkdir -p /usr/share/nginx/html/agrofusionTest

COPY --from=builder /app/dist /usr/share/nginx/html/agrofusionTest

RUN cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location /agrofusionTest/ {
        try_files $uri $uri/ /agrofusionTest/index.html;
    }

    location / {
        return 404;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|json)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
EOF

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
