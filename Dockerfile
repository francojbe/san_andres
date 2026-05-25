# Etapa 1: Construcción (Build)
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias limpiamente
RUN npm ci

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción (generará la carpeta /dist)
RUN npm run build

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiar el archivo de configuración personalizado de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 (Easypanel lo leerá automáticamente)
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
