<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Nest TypeScript starter kit by AghnatHs</p>
    <p align="center">

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript core kit (mainly for personal use), with pre-configure TypeORM, Logger (Pino), ExceptionFilter, and Interceptor.

## Disclaimer

This project is an independent starter kit built on top of the NestJS framework. It is not officially affiliated with, endorsed by, or maintained by the NestJS team.

It is intended solely for my personal use to accelerate development by providing preconfigured modules such as logging, validation, and database integration.

Use at your own discretion.

## What already configured

- TypeORM (migrations included by command "npm run migration:\*") on PostgreSQL
- e2e tests run on in-process PGlite, so no database server is needed for tests
- Logger (Pino) (log to console and files (daily rotation))
- ExceptionFilter (when response is error or HTTPException)
- Interceptor (when response is success)

- Centralized response using HTTPResponse class for consistency
- A single `.env` file (see below)
- An example vertical slice (`audit-logs`) with entity, service, controller, DTOs, migration, and e2e tests

## How I structure the project

Inspired by DDD and Vertical Slice architecture for the project structure

- Domain → Domain models + domain services
- Features (UseCases) → API layer (Controllers) + application services (UseCases) + DTOs + validators
- Infrastructure → Anything related to infra (ORM, Logger, ExceptionFilter, Interceptor, Mail things, etc)
- Libs → reusable utils can be used by Domain or Features (no frameworks dependencies)
- Migrations → TypeORM migration
- Types → mostly for extending Express.Request and Express.Response, but can be used for other shared types

<p align="center">
  <img src=".github/docs/vsa.png" width="600" />
</p>

- Each feature have its own implementation (but not strictly "free form"); When there is a common logic between features, Refactor it into the domain entity or domain services.
- Refactor repeated logic into a rich Domain
- Refactor repeated domain-agnostic code into services, repositories
- Integration test the Use Cases
- Unit test the domain

from https://www.jimmybogard.com/vertical-slice-architecture/: </br>
"If your team does understand refactoring, and can recognize when to push complex logic into the domain, into what DDD services should have been, and is familiar other Fowler/Kerievsky refactoring techniques, you'll find this style of architecture able to scale far past the traditional layered/concentric architectures."

other references: </br>

- https://www.milanjovanovic.tech/blog/vertical-slice-architecture-where-does-the-shared-logic-live
- https://verticalslicearchitecture.com/learn/cookbook/history.html

## Project setup

```bash
use the template to create your own repository, with (Use this template) butotn

$ git clone https://github.com/your-username/your-repository.git .

$ cd your-repository

$ npm install

# create your single local env file
$ cp .env.example .env

$ mkdir logs

# start a local PostgreSQL (Docker)
$ npm run db:up

$ npm run start:dev
```

## Environment variables

There is one env file: `.env`, with `.env.example` as the tracked template.

- The database is PostgreSQL. `docker-compose.yml` starts a matching local instance
  (`npm run db:up` / `npm run db:down`).
- Every `NODE_ENV` (`development`, `test`, `production`) reads the same `.env`.
- CI and containers inject variables directly. There, `loadEnv()` is a no-op and the injected
  values always win over anything in `.env`.

## Migration

## Migration (Development)

Migrations read your local `.env` file.

```bash
# Apply all migration to database
$ npm run migration:run

# generate migration based on current entities (Linux / MacOs)
$ npm run migration:generate --name=CreateUsersTable
# generate migration based on current entities (Windows)
$ npm run migration:generate:win --name=CreateUsersTable

# create empty migration file (Linux / MacOs)
$ npm run migration:create --name=CustomMigration
# create empty migration file (Windows)
$ npm run migration:create:win --name=CustomMigration

# undo most recent migration
$ npm run migration:revert
```

- Never edit existing migration, create a new one instead
- On Windows, use the \*:win variants because environment variable syntax differs (%VAR% - $VAR).

## Migration (Production)

In production the environment variables are injected, not read from a file. With those variables
set in the environment, run:

```bash
$ npm run migration:run:production
```

## Migration (Using compiled js)

If you want to run migration using compiled javascript files on dist folder, you can use this command

```bash
$ npm run build
$ NODE_ENV=production npm run migration:run:js
```

## Compile and run the project

```bash
# development mode
$ cp .env.example .env
$ npm run migration:run
$ npm run start:dev

# production mode
$ npm run build
$ npm run migration:run:production
$ npm run start:prod

# using docker (production)
$ cp .env.example .env
$ docker build --build-arg NODE_ENV=production -t nest-core-kit .
$ docker run -d -p 3000:3000 --env-file .env --name nest-core-kit-container nest-core-kit
```

## Run tests

```bash
# unit tests
$ npm run test

# unit tests (verbose)
$ npm run test:verbose

# e2e tests using in-process PGlite
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

TODO

## License

[MIT licensed](https://github.com/AghnatHs/nest-core-kit/blob/main/LICENSE).
