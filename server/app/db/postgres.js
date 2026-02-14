import config from "../config/index.js";
import { Sequelize } from "sequelize";
import migration from "./index.js";

export const sequelize = new Sequelize(
  config.PG_DATABASE_NAME,
  config.PG_USERNAME,
  config.PG_PASSWORD,
  {
    host: config.pg_host,
    dialect: config.pg_dialect,
    logging: false,
  }
);

async function initDatabase(fastify) {
  await sequelize.authenticate();
  fastify.log.info(`Postgres Database connection OK!`);

  // define models
  fastify.log.info(`Initializing sequelize connection and models...`);
  await migration.init(sequelize);
  fastify.log.info(`Migration sucessfully completed...`);

  // create tables (DEV ONLY)
  await sequelize.sync({});
}

async function postgresConnection(fastify, options) {
  try {
    await initDatabase(fastify);
  } catch (error) {
    throw error;
  }
}

export default postgresConnection;
