# Star Wars Movies API

Backend built with **NestJS** to manage movies. It imports films from the public
Star Wars API and exposes a role-protected REST API (JWT, `admin` / `regular`).

- Swagger docs: `http://localhost:3000/docs` (local, needs the API running)
- Raw OpenAPI JSON: `http://localhost:3000/docs-json`
- API contract: [`docs/openapi.json`](docs/openapi.json) (import it in https://editor.swagger.io or Postman)

## Stack

NestJS · TypeScript (strict) · PostgreSQL · TypeORM · JWT · bcrypt ·
class-validator · @nestjs/schedule · Swagger · Jest · Docker

## Architecture

Each feature module (`users`, `auth`, `movies`, `sync`) is split in layers:

```
domain/          plain classes + repository ports (no Nest, no TypeORM)
application/     use cases (business logic)
infrastructure/  TypeORM entities, repositories, bcrypt, HTTP client, cron
presentation/    controllers, DTOs, guards, decorators
```

Dependencies point inwards: `presentation → application → domain`.
`infrastructure` implements the ports defined in `domain` / `application`.
Repository ports are abstract classes, used as NestJS injection tokens.

## Requirements

- Node.js 22 LTS
- Docker (for PostgreSQL, or to run everything with compose)

## Run locally

```bash
# 1. Install dependencies
npm ci

# 2. Create the environment file
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env

# 3. Start PostgreSQL
docker run --name movies-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=movies -p 5432:5432 -d postgres:16

# 4. Start the API in watch mode
npm run start:dev
```

The API listens on `http://localhost:3000`. Tables are created automatically in
development (`synchronize`).

## Run everything with Docker Compose

```bash
docker compose up --build
```

API on `http://localhost:3000`, PostgreSQL on `localhost:5433`.
Compose runs with `NODE_ENV=development` so TypeORM creates the tables automatically.
Stop and remove data with `docker compose down -v`.

## Deployment

Not deployed. Run it with Docker Compose (see above).

## Environment variables

| Variable | Description | Default in `.env.example` |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `production` disables `synchronize` | `development` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection | `localhost`, `5432`, `postgres`, `postgres`, `movies` |
| `JWT_SECRET` | Secret used to sign tokens. **Required**: the app fails to start without it | placeholder |
| `JWT_EXPIRES_IN_SECONDS` | Token lifetime | `3600` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin created at startup | `admin@example.com` / `ChangeMe123!` |
| `SWAPI_URL` | Star Wars API films endpoint | `https://swapi.dev/api/films/` |

Change `JWT_SECRET` and `ADMIN_PASSWORD` outside of local testing.

## Quick start with the API

1. `POST /auth/login` with the admin credentials from `.env`. Copy the `accessToken`.
2. In Swagger (`/docs`), click **Authorize** and paste the token (without `Bearer `).
3. `POST /sync/movies` to import the films, then `GET /movies`.

## Endpoints and permissions

| Method | Route | Access |
| --- | --- | --- |
| POST | `/auth/sign-up` | Public. Always creates a `regular` user |
| POST | `/auth/login` | Public. Returns a JWT |
| GET | `/auth/me` | Any authenticated user |
| GET | `/movies` | Public |
| GET | `/movies/:id` | `regular` and `admin` |
| POST | `/movies` | `admin` |
| PATCH | `/movies/:id` | `admin` |
| DELETE | `/movies/:id` | `admin` |
| POST | `/sync/movies` | `admin` |

A cron job also runs the sync every day at 3 AM (server time).

## Tests

```bash
npm test            # unit tests
npm run test:cov    # with coverage report
```

Unit tests cover the use cases, the JWT and roles guards, the movies controller
(including the role metadata of each route), the sync and the movie mapper.
Repositories use abstract ports, so tests run with fakes: no database and no network.

Smoke test (needs the API running): `.\scripts\smoke-test.ps1` (PowerShell).
