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

async function postgresConnection(fastify, options) {
  let dbSuccess = null;

  try {
    await sequelize.authenticate();
    dbSuccess = true;
    fastify.log.info(`Postgres Database connection OK!`);
    fastify.log.info(`Initializing sequelize connection and models...`);
    await new Promise(async (resolve) => {
      await migration.init(sequelize);
      resolve(`Migration sucessfully completed...`);
    }).then((data) => fastify.log.info(data));
  } catch (error) {
    console.log(error);
    dbSuccess == false;
    process.exit(1);
  }
}

export default postgresConnection;
