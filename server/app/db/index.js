"use strict";
import models from "./models.js";

let sequelize;

const init = async (sequelizeObj) => {
  sequelize = sequelizeObj;
  const modelsName = Object.keys(models);

  for (const modelName of modelsName) {
    await models[modelName].init(sequelize);
  }
};

export default {
  init,
};
