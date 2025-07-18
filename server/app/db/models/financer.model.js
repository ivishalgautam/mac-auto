"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let FinancerModel = null;

const init = async (sequelize) => {
  FinancerModel = sequelize.define(
    constants.models.FINANCER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      logo: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
      },
      interest_percentage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      area_serve: {
        type: DataTypes.JSONB,
        allowNull: false,
        // [{state:"",cities:[""]}]
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await FinancerModel.sync({ alter: true });
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS financer_area_serve_gin
    ON ${constants.models.FINANCER_TABLE}
    USING GIN (area_serve)
  `);
};

const create = async (req) => {
  return await FinancerModel.create({
    name: req.body.name,
    logo: req.body.logo,
    area_serve: req.body.area_serve,
    interest_percentage: req.body.interest_percentage,
  });
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await FinancerModel.update(
    {
      name: req.body.name,
      logo: req.body.logo,
      area_serve: req.body.area_serve,
      interest_percentage: req.body.interest_percentage,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};
  let q = req.query.q;
  if (q) {
    whereConditions.push(
      `(fin.name ILIKE :query OR fin.area_serve ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length > 0) {
    whereClause = "WHERE " + whereConditions.join(" AND ");
  }

  let countQuery = `
    SELECT
        COUNT(fin.id) OVER()::integer as total
      FROM ${constants.models.FINANCER_TABLE} fin
      ${whereClause}`;

  let query = `
      SELECT
        fin.*
      FROM ${constants.models.FINANCER_TABLE} fin
      ${whereClause}
      ORDER BY fin.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await FinancerModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await FinancerModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { financers: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await FinancerModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id) => {
  return await FinancerModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
