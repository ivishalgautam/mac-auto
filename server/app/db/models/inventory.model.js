"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, Op, QueryTypes } from "sequelize";

let InventoryModel = null;
const init = async (sequelize) => {
  InventoryModel = sequelize.define(
    constants.models.INVENTORY_TABLE,
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
      vehicle_color_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_COLOR_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      vehicle_variant_map_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.VEHICLE_VARIANT_MAP_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      chassis_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "Chassis no. exist" },
      },
      motor_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      battery_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      controller_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      charger_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "sold", "scrapped"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["vehicle_color_id"] },
        {
          fields: ["chassis_no"],
          unique: true,
        },
        { fields: ["status"] },
        { fields: ["motor_no"] },
        { fields: ["battery_no"] },
        { fields: ["controller_no"] },
        { fields: ["charger_no"] },
      ],
    }
  );

  return InventoryModel;
  await InventoryModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await InventoryModel.create(
    {
      vehicle_id: req.body.vehicle_id,
      vehicle_color_id: req.body.vehicle_color_id,
      chassis_no: req.body.chassis_no,
      motor_no: req.body.motor_no,
      battery_no: req.body.battery_no,
      controller_no: req.body.controller_no,
      charger_no: req.body.charger_no,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (data, transaction) => {
  const options = { returning: true, raw: true };
  if (transaction) options.transaction = transaction;

  const newRecord = await InventoryModel.bulkCreate(data, options);
  return newRecord.map((item) => item.dataValues);
};

const update = async (req, id) => {
  return await InventoryModel.update(
    {
      chassis_no: req.body.chassis_no,
      motor_no: req.body.motor_no,
      battery_no: req.body.battery_no,
      controller_no: req.body.controller_no,
      charger_no: req.body.charger_no,
      status: req.body.status,
    },
    {
      where: { id: req?.params?.id || id },
      returning: true,
      raw: true,
    }
  );
};

const bulkUpdateStatus = async (ids = [], status, transaction) => {
  if (!ids.length) return [];

  const options = {
    where: { id: { [Op.in]: ids } },
    returning: true,
  };
  if (transaction) options.transaction = transaction;

  const [, updatedRecords] = await InventoryModel.update(
    { status: status },
    options
  );

  return updatedRecords;
};

const bulkUpdateStatusByChassisNos = async (nos = [], status, transaction) => {
  if (!nos.length) return [];

  const options = {
    where: { chassis_no: { [Op.in]: nos } },
    returning: true,
  };
  if (transaction) options.transaction = transaction;

  const [, updatedRecords] = await InventoryModel.update(
    { status: status },
    options
  );

  return updatedRecords;
};

const updateStatusByChassisNo = async (no, status, transaction) => {
  const options = {
    where: { chassis_no: no },
    returning: true,
  };
  if (transaction) options.transaction = transaction;

  const [, updatedRecords] = await InventoryModel.update(
    { status: status },
    options
  );

  return updatedRecords;
};

const getActiveInventoryIds = async (vehicleId) => {
  return await InventoryModel.findAll({
    where: {
      vehicle_id: vehicleId,
      status: "active",
    },
    attributes: ["id", "chassis_no"],
    raw: true,
  });
};

const getByVehicleId = async (req, vehicle_id) => {
  const whereConditions = ["invnt.vehicle_id = :vehicle_id"];
  const queryParams = { vehicle_id: vehicle_id };
  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;
  const colors = req.query?.colors?.split(".") ?? null;
  const variants = req.query?.variants?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(invnt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`invnt.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  if (colors && colors.length) {
    whereConditions.push(`LOWER(vclr.color_hex) = ANY(:colors)`);
    queryParams.colors = `{${colors.map((color) => String(color).toLowerCase()).join(",")}}`;
  }
  if (variants && variants.length) {
    whereConditions.push(`vvm.vehicle_variant_id = ANY(:variants)`);
    queryParams.variants = `{${variants.join(",")}}`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      invnt.*,
      vclr.color_hex,
      vclr.color_name,
      vv.variant_name
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = invnt.vehicle_variant_map_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} as vv ON vv.id = vvm.vehicle_variant_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = invnt.vehicle_variant_map_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} as vv ON vv.id = vvm.vehicle_variant_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await InventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await InventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;
  const colors = req.query?.colors?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(invnt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`invnt.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  if (colors && colors.length) {
    whereConditions.push(`LOWER(vclr.color_hex) = ANY(:colors)`);
    queryParams.colors = `{${colors.map((color) => String(color).toLowerCase()).join(",")}}`;
  }

  const vehicleId = req.query?.vid ?? null;
  if (vehicleId) {
    whereConditions.push("invnt.vehicle_id = :vehicle_id");
    queryParams.vehicle_id = vehicleId;
  }

  const vehicleColorId =
    req.query?.vcid && req.query?.vcid !== "null" ? req.query?.vcid : null;
  if (vehicleColorId) {
    whereConditions.push("invnt.vehicle_color_id = :vehicle_color_id");
    queryParams.vehicle_color_id = vehicleColorId;
  }
  const vehicleVariantMapId =
    req.query?.vvmid && req.query?.vvmid !== "null" ? req.query?.vvmid : null;
  if (vehicleVariantMapId) {
    whereConditions.push("vvm.id = :vehicle_variant_map_id");
    queryParams.vehicle_variant_map_id = vehicleVariantMapId;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      invnt.*,
      vclr.color_hex,
      vclr.color_name
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = invnt.vehicle_variant_map_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = invnt.vehicle_variant_map_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} as vv ON vv.id = vvm.vehicle_variant_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await InventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await InventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getByVehicleColorId = async (req, vehicleColorId) => {
  const whereConditions = ["invnt.vehicle_color_id = :vehicle_color_id"];
  const queryParams = { vehicle_color_id: vehicleColorId };
  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;
  const colors = req.query?.colors?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(invnt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`invnt.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  if (colors && colors.length) {
    whereConditions.push(`LOWER(vclr.color_hex) = ANY(:colors)`);
    queryParams.colors = `{${colors.map((color) => String(color).toLowerCase()).join(",")}}`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      invnt.*,
      vclr.color_hex,
      vclr.color_name
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await InventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await InventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await InventoryModel.findOne({
    where: { id: req?.params?.id || id },
  });
};

const getByChassis = async (chassis_no) => {
  return await InventoryModel.findOne({
    where: { chassis_no: chassis_no },
    raw: true,
  });
};

const deleteById = async (id) => {
  return await InventoryModel.destroy({
    where: { id: id },
  });
};

const deleteByChassisNumbers = async (numbers, transaction) => {
  return await InventoryModel.destroy({
    where: {
      chassis_no: { [Op.in]: numbers },
    },
    transaction,
    force: true,
    logging: true,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  bulkUpdateStatus: bulkUpdateStatus,
  bulkUpdateStatusByChassisNos: bulkUpdateStatusByChassisNos,
  getByVehicleId: getByVehicleId,
  getByVehicleColorId: getByVehicleColorId,
  deleteById: deleteById,
  deleteByChassisNumbers: deleteByChassisNumbers,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
  getByChassis: getByChassis,
  getActiveInventoryIds: getActiveInventoryIds,
  updateStatusByChassisNo: updateStatusByChassisNo,
};
