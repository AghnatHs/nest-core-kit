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

- TypeORM (migrations included by command "npm run migration:*")
- Logger (Pino) (log to console and files (daily rotation))
- ExceptionFilter (when response is error or HTTPException)
- Interceptor (when response is success)

- Centralized response using HTTPResponse class for consistency
- .env.* (per development) 

Fully Customizable

## Project setup

```bash
use the template to create your own repository, with (Use this template) butotn
 
$ git clone https://github.com/your-username/your-repository.git .

$ cd your-repository

$ npm install

# setup .env.production, .env.development, and .env.test from .env.example
$ cp .env.example .env.production 
$ cp .env.example .env.staging # optional in production environment
$ cp .env.example .env.development # optional in production environment
$ cp .env.example .env.test # optional in production environment

$ mkdir logs

$ npm run start:dev
```

## Migration (Development)
Migration in development will use .env.development
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
- On Windows, use the *:win variants because environment variable syntax differs (%VAR% - $VAR).

## Migration (Production)
For running a newly migration in production, just run this command
```bash
$ npm run migration:run:production OR $ npm run migration:run:production-js
```

## Migration (Staging)
For running a newly migration in staging, just run this command
```bash
$ npm run migration:run:staging OR $ npm run migration:run:staging-js
```

## Migration (Using compiled js)
If you want to run migration using compiled javascript files on dist folder, you can use this command
```bash
$ npm run build

# For production, will use .env.production 
$ NODE_ENV=production npm run migration:run:js

# For staging, will use .env.staging
$ NODE_ENV=staging npm run migration:run:js
```

## Compile and run the project

```bash
# development mode, will use .env.development
$ cp .env.example .env.development
$ npm run migration:run
$ npm run start:dev

# production mode, will use .env.production
$ cp .env.example .env.production
$ npm run build
$ npm run migration:run:production
$ npm run start:prod

# using docker (production)
$ cp .env.example .env
$ docker build --build-arg NODE_ENV=production -t nest-core-kit .
$ docker run -d -p 3000:3000 --env-file .env --name nest-core-kit-container nest-core-kit

# using docker (staging)
$ cp .env.example .env.staging
$ docker build --build-arg NODE_ENV=staging -t nest-core-kit:staging .
$ docker run -d -p 3000:3000 --env-file .env.staging --name nest-core-kit-staging nest-core-kit:staging
```

## Run tests

```bash
# unit tests
$ npm run test

# unit tests (verbose)
$ npm run test:verbose

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

TODO

## License

[MIT licensed](https://github.com/AghnatHs/nest-core-kit/blob/main/LICENSE).
