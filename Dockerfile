# 1. Usamos la imagen oficial de Node.js versión 20 (como pide el README)
# Usamos la versión "alpine" porque es mucho más liviana y rápida de descargar
FROM node:20-alpine

# 2. Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de configuración de dependencias primero
COPY package*.json ./

# 4. Instalamos las dependencias de Node.js
RUN npm install

# 5. Copiamos el resto del código del frontend
COPY . .

# 6. Exponemos el puerto 5173 (El puerto por defecto de Vite)
EXPOSE 5173

# 7. El comando para arrancar el servidor de desarrollo
# NOTA CLAVE: Le agregamos "--", "--host", "0.0.0.0" para obligar a Vite a mostrar la página web hacia afuera del contenedor.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]