"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let ColorModel = null;

const init = async (sequelize) => {
  ColorModel = sequelize.define(
    constants.models.VEHICLE_COLOR_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      color_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color_hex: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["color_name"] }, { fields: ["color_hex"] }],
    }
  );

  return ColorModel;
  await ColorModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await ColorModel.create(
    {
      color_name: req.body.color_name,
      color_hex: req.body.color_hex,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (bulkdData) => {
  return await ColorModel.bulkCreate(bulkdData);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await ColorModel.update(
    {
      color_name: req.body.color_name,
      color_hex: req.body.color_hex,
    },
    options
  );

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
      vhlclr.*
    FROM ${constants.models.VEHICLE_COLOR_TABLE} vhlclr
    ${whereClause}
    GROUP BY vhlclr.id
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(vhlclr.id) OVER()::integer as total
    FROM ${constants.models.VEHICLE_COLOR_TABLE} vhlclr
  ${whereClause}
  `;

  const colors = await ColorModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await ColorModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { colors, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await ColorModel.findOne({
    where: { id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
};
