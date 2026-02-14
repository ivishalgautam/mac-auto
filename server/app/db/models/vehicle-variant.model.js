"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let VehicleVariantModel = null;

const init = async (sequelize) => {
  VehicleVariantModel = sequelize.define(
    constants.models.VEHICLE_VARIANT_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      variant_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["variant_name"] }],
    }
  );

  return VehicleVariantModel;
  await VehicleVariantModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await VehicleVariantModel.create(
    { variant_name: req.body.variant_name },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (bulkdData) => {
  return await VehicleVariantModel.bulkCreate(bulkdData);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await VehicleVariantModel.update(
    { variant_name: req.body.variant_name },
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

  const q = req.query?.q ?? null;
  if (q) {
    whereConditions.push("vr.variant_name ILIKE :q");
    queryParams.q = `%${q}%`;
  }

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
      vr.*
    FROM ${constants.models.VEHICLE_VARIANT_TABLE} vr
    ${whereClause}
    GROUP BY vr.id
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(vr.id) OVER()::integer as total
    FROM ${constants.models.VEHICLE_VARIANT_TABLE} vr
  ${whereClause}
  `;

  const variants = await VehicleVariantModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await VehicleVariantModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { variants, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await VehicleVariantModel.findOne({
    where: { id: req.params?.id || id },
  });
};
const deleteById = async (req, id) => {
  return await VehicleVariantModel.destroy({
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
  deleteById: deleteById,
};
