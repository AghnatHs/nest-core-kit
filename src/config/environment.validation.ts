import * as Joi from 'joi';

/**
 * Configuration validation schema using Joi.
 * This schema validates environment variables for the application.
 */
export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  APP_PORT: Joi.number().default(5000),

  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  TYPEORM_SYNC: Joi.boolean().default(false),
  TYPEORM_LOGGING: Joi.boolean().default(false),
});
