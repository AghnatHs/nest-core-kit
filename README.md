<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Nest TypeScript starter kit by AghnatHs</p>
    <p align="center">

### TODO

- Dockerize

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript core kit (mainly for personal use), with pre-configure TypeORM, Logger (Pino), ExceptionFilter, and Interceptor.

## Disclaimer

This project is an independent starter kit built on top of the NestJS framework. It is not officially affiliated with, endorsed by, or maintained by the NestJS team.

It is intended solely for my personal use to accelerate development by providing preconfigured modules such as logging, validation, and database integration.

Use at your own discretion.

## What already configured

- TypeORM (migrations included by command "npm run migration:*")
- Logger (Pino) (log to console and files)
- ExceptionFilter (when response is error or HTTPException)
- Interceptor (when response is success)

- Centralized response using HTTPResponse class for consistency
- .env.* (per development) 

Fully Customizable

## Project setup

```bash
$ git clone --depth=1 https://github.com/AghnatHs/nest-core-kit.git nest-core-kit

$ cd nest-core-kit

$ rm -rf .git

$ git init

$ npm install

# setup .env.production, .env.development, and .env.test from .env.example
$ cp .env.example .env.production
$ cp .env.example .env.development
$ cp .env.example .env.test

$ mkdir logs

$ npm run start:dev
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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
