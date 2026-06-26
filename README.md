# BaseCase Backend

Node.js scaffold with **Express 5**, **Zod**, **Pino** logging, and **Drizzle ORM** (PostgreSQL).

## Stack

| Tool | Purpose |
|------|---------|
| [Express](https://expressjs.com/) | HTTP server |
| [Zod](https://zod.dev/) | Env + request validation |
| [Pino](https://getpino.io/) + [pino-http](https://github.com/pinojs/pino-http) | Structured logging |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe PostgreSQL access |

## Prerequisites

- Node.js 18+
- PostgreSQL (local or cloud)

## Setup

```bash
cp .env.example .env
# Edit DATABASE_URL in .env

npm install
npm run db:push   # apply schema (dev)
npm run dev
```

Server runs at `http://localhost:3001`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:generate` | Generate SQL migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (prototyping) |
| `npm run db:studio` | Open Drizzle Studio |

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

Future endpoints will be mounted under `/api/v1`.

## Project structure

```
src/
├── app.ts              # Express app + middleware
├── index.ts            # Server entry + graceful shutdown
├── config/env.ts       # Zod-validated environment
├── db/
│   ├── index.ts        # Drizzle + pg Pool
│   └── schema.ts       # Table definitions
├── lib/logger.ts       # Pino logger
├── middleware/
│   ├── errorHandler.ts
│   └── validate.ts     # Zod request validation (for /api/v1 routes)
└── routes/             # HTTP routes
```
