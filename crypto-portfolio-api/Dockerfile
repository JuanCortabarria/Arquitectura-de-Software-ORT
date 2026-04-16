# ── Stage 1: Build ──────────────────────────────────────────────
# Instala TODAS las dependencias (incluidas las dev como TypeScript)
# y compila el código TypeScript a JavaScript.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx tsc

# ── Stage 2: Production ────────────────────────────────────────
# Solo copia el código compilado (dist/) y las dependencias de
# producción. La imagen final es mucho más liviana porque no
# incluye TypeScript, ts-node, nodemon, etc.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el JavaScript compilado del stage anterior
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
