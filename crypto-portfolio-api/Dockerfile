# Imagen base: Node.js versión 20 con Alpine Linux (imagen liviana)
# Alpine pesa ~50MB vs ~900MB de la imagen Ubuntu completa
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos PRIMERO los archivos de dependencias (package.json y package-lock.json).
# Docker guarda cada instrucción como una "capa" en caché.
# Si el código cambia pero las dependencias no, Docker reutiliza esta capa
# y evita volver a ejecutar npm install (ahorra mucho tiempo).
COPY package*.json ./

# Instalamos solo las dependencias de producción (sin typescript, ts-node, nodemon)
# npm ci es más estricto que npm install: usa exactamente las versiones del lock file
RUN npm ci --omit=dev

# Copiamos el resto del código fuente
# Nota: el .dockerignore evita que node_modules y .env entren al contenedor
COPY . .

# Compilamos TypeScript → JavaScript dentro del contenedor
# Necesitamos tsc, pero como no está en producción, lo ejecutamos desde npx
RUN npx tsc

# Informamos qué puerto usa la app (coincide con PORT en .env)
EXPOSE 4000

# Comando para arrancar la app.
# El .env NO está en la imagen (está en .dockerignore por seguridad).
# Las variables de entorno se pasan al ejecutar el contenedor con:
#   docker run -p 4000:4000 --env-file .env crypto-portfolio-api
CMD ["node", "dist/index.js"]
