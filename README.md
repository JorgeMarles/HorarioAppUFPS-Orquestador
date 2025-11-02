# Express API Starter with Typescript

A JavaScript Express v5 starter template with sensible defaults.

How to use this template:

```sh
pnpm dlx create-express-api@latest --typescript --directory my-api-name
```

# Orchestrator - HorarioAppUFPS

Orchestrator para Web Scrapers en HorarioAppUFPS con integración a PostgreSQL y Redis.

## Tecnologías

- **Node.js** + **TypeScript** + **Express**
- **Prisma ORM** + **PostgreSQL** 
- **BullMQ** + **Redis**
- **TSOA** (Swagger/OpenAPI)
- **Pino** (Logging estructurado)
- **Zod** (validación de variables de entorno)

## Configuración

### 1. Variables de entorno
Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

### 2. Base de datos PostgreSQL

#### Opción A: Prisma Cloud (recomendado para desarrollo)
```bash
npx prisma dev
```

#### Opción B: Docker local
```bash
docker run -d \
  --name postgres-orchestrator \
  -e POSTGRES_DB=orchestrator \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev123 \
  -p 5432:5432 \
  postgres:15-alpine
```

Luego en `.env`:
```env
DATABASE_URL=postgresql://dev:dev123@localhost:5432/orchestrator
```

### 3. Redis
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 4. Instalación de dependencias
```bash
pnpm install
```

### 5. Configurar base de datos
```bash
# Generar cliente Prisma
pnpm run db:generate

# Crear tablas (migración)
pnpm run db:migrate

# (Opcional) Explorar BD con UI web
pnpm run db:studio
```

## Desarrollo

### Ejecutar en modo desarrollo
```bash
pnpm run dev
```

### Generar documentación API
```bash
pnpm run swagger
```

### Construir para producción
```bash
pnpm run build
pnpm start
```

## API Endpoints

### Scraper
- `GET /scrapper/{n}` - Crear workflow con n jobs
- `GET /docs` - Documentación Swagger

### Workflow
- `GET /workflow` - Listar todos los workflows
- `GET /workflow/{id}` - Obtener workflow por ID
- `GET /workflow/{id}/progress` - Progreso del workflow

## Modelos de datos

### Workflow
- `id` (UUID)
- `startDate`, `endDate`
- `state` (PROCESSING, SUCCESS, ERROR, STOPPED)
- Relación 1:N con Jobs

### Job
- `id` (BigInt autoincremental)
- `number` (orden en el workflow)
- `type` (PENSUM_INFO, SUBJECT_INFO, EQUIVALENCE_INFO)
- `state` (PENDING, SUCCESS, ERROR)
- `response` (resultado del scraping)
- `description`
- Relación N:1 con Workflow

## Scripts útiles

```bash
# Base de datos
pnpm run db:studio     # UI web para explorar datos
pnpm run db:push       # Aplicar cambios de schema sin migración
pnpm run db:reset      # Resetear BD y aplicar migraciones

# Desarrollo
pnpm run type-check    # Verificar tipos TypeScript
pnpm run lint          # Linter
pnpm run test          # Tests
```

## Arquitectura

1. **Controller** → recibe requests HTTP
2. **Service** → lógica de negocio + BD
3. **Queue** → BullMQ para procesamiento asíncrono
4. **Worker** → procesa jobs de scraping
5. **Prisma** → ORM para PostgreSQL

## Flujo de trabajo

1. Request `GET /scrapper/5` 
2. Se crea Workflow en BD
3. Se crean 5 Jobs en BD (PENDING)
4. Se encolan 5 jobs en Redis
5. Worker procesa jobs uno por uno
6. Se actualiza estado en BD (SUCCESS/ERROR)
7. Al completar todos: Workflow → SUCCESS

## Logging

La aplicación usa **Pino** para logging estructurado y de alta performance:

### Configuración automática por ambiente:
- **Desarrollo**: Logs coloridos y formateados en consola
- **Producción**: Logs estructurados en JSON

### Loggers por módulo:
```typescript
import { apiLogger, queueLogger, dbLogger, appLogger } from './util/logger.js';

// Usar según el contexto
apiLogger.info({ userId: 123 }, 'User logged in');
queueLogger.error({ jobId: 'abc' }, 'Job failed');
dbLogger.debug({ query: 'SELECT *' }, 'Database query');
```

### Ejemplos de logs:
```bash
# Desarrollo
[INFO] 🚀 Server listening on http://localhost:3000
[DEBUG] Job will complete in 2.5s

# Producción (JSON)
{"level":"info","time":"2025-10-31T10:30:00.000Z","module":"queue","jobId":"123","msg":"Job completed"}
```

### Variables de logging:
- `NODE_ENV=production` → JSON logs
- `NODE_ENV=development` → Pretty logs

### Error: BullMQ maxRetriesPerRequest must be null
Ya está configurado en `cososervice.ts`.
- [zod](https://www.npmjs.com/package/zod)
  - Validated TypeSafe env with zod schema
- [supertest](https://www.npmjs.com/package/supertest)
  - HTTP assertions made easy via superagent.

## Setup

```
pnpm install
```

## Lint

```
pnpm run lint
```

## Test

```
pnpm run test
```

## Development

```
pnpm run dev
```
