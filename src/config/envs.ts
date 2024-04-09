import 'dotenv/config';
import * as joi from 'joi';
//nest-env -->es el snippet

interface EnvsVars {
  PORT: number;
  DATABASE_URL: string;
}

const ENVS_SCHEMA = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = ENVS_SCHEMA.validate(process.env);

if (error) {
  throw new Error(`Config validation Error: ${error.message} `);
}

const ENV_VARS: EnvsVars = value;

export const ENVS = {
  port: ENV_VARS.PORT,
  databaseUrl: ENV_VARS.DATABASE_URL,
};
