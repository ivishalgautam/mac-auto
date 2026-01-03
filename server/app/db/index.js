"use strict";
import models from "./models.js";

let sequelize;

const init = async (sequelizeObj) => {
  sequelize = sequelizeObj;
  const modelsName = Object.keys(models);

  const promises = modelsName.map(async (model) => {
    try {
      await models[model].init(sequelize);
    } catch (err) {
      throw new Error(`Failed to initialize model: ${model}`);
    }
  });

  await Promise.all(promises);

  // for (const modelName of modelsName) {
  //   try {
  //     await models[modelName].init(sequelize);
  //   } catch (err) {
  //     console.error(`Failed to initialize model: ${modelName}`);
  //     throw err; // crash startup
  //   }
  // }
};

export default {
  init,
};
