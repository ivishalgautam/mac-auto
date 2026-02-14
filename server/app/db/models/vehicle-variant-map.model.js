"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let VehicleVariantMapModel = null;

const init = async (sequelize) => {
  VehicleVariantMapModel = sequelize.define(
    constants.models.VEHICLE_VARIANT_MAP_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      vehicle_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_VARIANT_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["vehicle_id"] }, { fields: ["vehicle_variant_id"] }],
    }
  );

  return VehicleVariantMapModel;
  await VehicleVariantMapModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await VehicleVariantMapModel.create(
    {
      vehicle_id: req.body.vehicle_id,
      vehicle_variant_id: req.body.vehicle_variant_id,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (bulkdData) => {
  return await VehicleVariantMapModel.bulkCreate(bulkdData);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await VehicleVariantMapModel.update(
    { vehicle_variant_id: req.body.vehicle_variant_id },
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
      vvm.*
    FROM ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm
    ${whereClause}
    GROUP BY vvm.id
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(vvm.id) OVER()::integer as total
    FROM ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm
  ${whereClause}
  `;

  const variants = await VehicleVariantMapModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await VehicleVariantMapModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { variants, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await VehicleVariantMapModel.findOne({
    where: { id: req.params?.id || id },
  });
};

const getByVariantAndVehicleId = async (variantId, vehicleId) => {
  return await VehicleVariantMapModel.findOne({
    where: { vehicle_variant_id: variantId, vehicle_id: vehicleId },
    raw: true,
  });
};

const getByVehicleId = async (req, id) => {
  const vehicleId = req.params?.id || id;
  const whereConditions = [`vvm.vehicle_id = :vehicleId`];
  const queryParams = { vehicleId: vehicleId };

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
  SELECT DISTINCT vvm.id, 
      vv.variant_name
    FROM ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} as vv ON vv.id = vvm.vehicle_variant_id
    ${whereClause}
  `;

  const results = await VehicleVariantMapModel.sequelize.query(query, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
  });

  return results;
};

export default {
  init: init,
  create: create,
  update: update,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
  getByVehicleId: getByVehicleId,
  getByVariantAndVehicleId: getByVariantAndVehicleId,
};
