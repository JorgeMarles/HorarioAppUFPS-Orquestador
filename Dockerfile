# Multi-stage build para menor tamaño final
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml tsoa.json ./
COPY tsconfig.json ./

# Copiar schema de Prisma
COPY prisma/ ./prisma/

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Generar cliente de Prisma
RUN pnpm prisma generate

# Copiar código fuente
COPY src/ ./src/

# Generar Swagger y compilar
RUN pnpm run build

# Instalar solo dependencias de producción
RUN pnpm prune --prod

# Stage final - imagen mínima
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar archivos compilados y dependencias desde builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Crear script de inicio
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nodejs

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["./docker-entrypoint.sh"]