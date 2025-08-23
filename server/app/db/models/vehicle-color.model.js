"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let VehicleColorModel = null;

const init = async (sequelize) => {
  VehicleColorModel = sequelize.define(
    constants.models.VEHICLE_COLOR_TABLE,
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
      color_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color_hex: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      carousel: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      gallery: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["color_name"] },
        { fields: ["color_hex"] },
      ],
    }
  );

  await VehicleColorModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await VehicleColorModel.create(
    {
      vehicle_id: req.body.vehicle_id,
      color_name: req.body.color_name,
      color_hex: req.body.color_hex,
      carousel: req.body.carousel,
      gallery: req.body.gallery,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (bulkdData) => {
  return await VehicleColorModel.bulkCreate(bulkdData);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await VehicleColorModel.update(
    {
      color_name: req.body.color_name,
      color_hex: req.body.color_hex,
      carousel: req.body.carousel,
      gallery: req.body.gallery,
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

  const colors = await VehicleColorModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await VehicleColorModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { colors, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await VehicleColorModel.findOne({
    where: { id: req.params?.id || id },
  });
};

const getByColorAndVehicleId = async (colorHex, vehicleId) => {
  return await VehicleColorModel.findOne({
    where: { color_hex: colorHex, vehicle_id: vehicleId },
    raw: true,
  });
};

const getByVehicleId = async (req, id, options = {}) => {
  const vehicleId = req.params?.id || id;
  const whereConditions = [`vhclr.vehicle_id = :vehicleId`];
  const queryParams = { vehicleId: vehicleId };

  const attributes = options.attributes?.length
    ? options.attributes
        .map((attr) => {
          return attr.includes(".") ? attr : `vhclr.${attr}`;
        })
        .join(", ")
    : "vhclr.*";

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
  SELECT DISTINCT vhclr.id, ${attributes}
    FROM ${constants.models.VEHICLE_COLOR_TABLE} vhclr
    ${whereClause}
  `;

  const results = await VehicleColorModel.sequelize.query(query, {
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
  getByColorAndVehicleId: getByColorAndVehicleId,
};
