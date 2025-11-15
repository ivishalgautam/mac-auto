"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let DealerInventoryModel = null;

const init = async (sequelize) => {
  DealerInventoryModel = sequelize.define(
    constants.models.DEALER_INVENTORY_TABLE,
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
      dealer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.DEALER_TABLE,
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
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["vehicle_color_id"] },
        { fields: ["vehicle_variant_map_id"] },
        {
          fields: ["chassis_no"],
          unique: true,
        },
        { fields: ["motor_no"] },
        { fields: ["battery_no"] },
        { fields: ["controller_no"] },
        { fields: ["charger_no"] },
      ],
    }
  );

  await DealerInventoryModel.sync({ alter: true });
};

const create = async (
  { vehicle_color_id, vehicle_id, dealer_id, chassis_no },
  transaction
) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await DealerInventoryModel.create(
    {
      vehicle_color_id: vehicle_color_id,
      vehicle_id: vehicle_id,
      dealer_id: dealer_id,
      chassis_no: chassis_no,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (data, transaction) => {
  const options = { returning: true, raw: true };
  if (transaction) options.transaction = transaction;

  const newRecord = await DealerInventoryModel.bulkCreate(data, options);
  return newRecord.map((item) => item.dataValues);
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await DealerInventoryModel.update(
    {
      chassis_no: req.body.chassis_no,
      status: req.body.status,
    },
    options
  );
};

const updateStatusByChassisNo = async (no, status, transaction) => {
  const options = {
    where: { chassis_no: no },
    returning: true,
  };
  if (transaction) options.transaction = transaction;

  const [, updatedRecords] = await DealerInventoryModel.update(
    { status: status },
    options
  );

  return updatedRecords;
};

const updateByDealerId = async (req, id) => {
  return await DealerInventoryModel.update(
    { quantity: req.body.quantity },
    {
      where: { dealer_id: id },
      returning: true,
      raw: true,
    }
  );
};

const updateQuantity = async (quantity, id, transaction) => {
  const options = {
    where: { id: id },
    returning: true,
    raw: true,
  };

  if (transaction) options.transaction = transaction;

  return await DealerInventoryModel.update({ quantity: quantity }, options);
};

const getById = async (id) => {
  return await DealerInventoryModel.findOne({
    where: {
      id: id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const get = async (req, dealerId) => {
  const { role, id } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  let dealerJoin = "";
  if (role === "dealer") {
    dealerJoin = `AND dlrinvn.dealer_id = :dealer_id`;
    queryParams.dealer_id = dealerId;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const status = req.query?.status?.split(".") ?? null;
  if (status && status.length) {
    whereConditions.push(`dlrinvn.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const category = req.query.category ? req.query.category.split(".") : null;
  if (category?.length) {
    whereConditions.push(`vh.category = any(:category)`);
    queryParams.category = `{${category.join(",")}}`;
  }

  const vehicleColorId =
    req.query?.vcid && req.query?.vcid !== "null" ? req.query?.vcid : null;
  if (vehicleColorId) {
    whereConditions.push("dlrinvn.vehicle_color_id = :vehicle_color_id");
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

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
    SELECT 
        vh.id, vh.title, vh.specifications, vh.category, vh.slug, vh.carousel, vh.dealer_price, vh.created_at,
        (vh.pricing->0->>'base_price')::numeric AS starting_from,
        COALESCE(
          JSON_AGG(
            DISTINCT JSON_BUILD_OBJECT(
              'id', vhclr.id,
              'color_name', vhclr.color_name,
              'color_hex', vhclr.color_hex
            )::jsonb
          ) FILTER (WHERE vhclr.id IS NOT NULL), '[]'
        ) AS colors,
        COALESCE(
          JSON_AGG(
            DISTINCT JSON_BUILD_OBJECT(
              'id', vv.id,
              'variant_name', vv.variant_name
            )::jsonb
          ) FILTER (WHERE vv.id IS NOT NULL), '[]'
        ) as variants,
        COUNT(DISTINCT CASE WHEN dlrinvn.status = 'active' THEN dlrinvn.id END) AS active_quantity,
        COUNT(DISTINCT CASE WHEN dlrinvn.status = 'inactive' THEN dlrinvn.id END) AS inactive_quantity,
        COUNT(DISTINCT CASE WHEN dlrinvn.status = 'sold' THEN dlrinvn.id END) AS sold_quantity,
        COUNT(DISTINCT CASE WHEN dlrinvn.status = 'scrapped' THEN dlrinvn.id END) AS scrapped_quantity
    FROM ${constants.models.VEHICLE_TABLE} vh
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON vhclr.vehicle_id = vh.id
    LEFT JOIN ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn ON vh.id = dlrinvn.vehicle_id ${dealerJoin}
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm ON vvm.id = dlrinvn.vehicle_variant_map_id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} vv ON vv.id = vvm.vehicle_variant_id
    ${whereClause}
    GROUP BY vh.id
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;
  console.log(query);
  const countQuery = `
    SELECT COUNT(DISTINCT vh.id) AS total
    FROM ${constants.models.VEHICLE_TABLE} vh
    LEFT JOIN ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm ON vvm.id = dlrinvn.vehicle_variant_map_id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} vv ON vv.id = vvm.vehicle_variant_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id ${dealerJoin}
    ${whereClause}
  `;

  const inventory = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return {
    inventory,
    total: count?.total ?? 0,
  };
};

const getChassis = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const status = req.query?.status?.split(".") ?? null;
  if (status && status.length) {
    whereConditions.push(`dlrin.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const vehicleId = req.query?.vid ?? null;
  if (vehicleId) {
    whereConditions.push("dlrin.vehicle_id = :vehicle_id");
    queryParams.vehicle_id = vehicleId;
  }

  const vehicleColorId =
    req.query?.vcid && req.query?.vcid !== "null" ? req.query?.vcid : null;
  if (vehicleColorId) {
    whereConditions.push("dlrin.vehicle_color_id = :vehicle_color_id");
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
      dlrin.*,
      vclr.color_hex,
      vclr.color_name
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrin
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = dlrin.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = dlrin.vehicle_variant_map_id 
    ${whereClause}
    ORDER BY dlrin.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(dlrin.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrin
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = dlrin.vehicle_color_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} as vvm ON vvm.id = dlrin.vehicle_variant_map_id 
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} as vv ON vv.id = vvm.vehicle_variant_id 
    ${whereClause}
    ORDER BY dlrin.created_at DESC
  `;

  const data = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getColors = async (req, vehicleId) => {
  const { role, id } = req.user_data;

  const whereConditions = [`dlrinvn.vehicle_id = :vehicleId`];
  const queryParams = { vehicleId: vehicleId };

  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
  SELECT DISTINCT vhclr.id, vhclr.color_name, vhclr.color_hex
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON dlrinvn.vehicle_color_id = vhclr.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
    ${whereClause}
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(dlrinvn.id) OVER()::integer as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON dlrinvn.vehicle_color_id = vhclr.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
    ${whereClause}
  `;

  const colors = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { colors, total: count?.total ?? 0 };
};

const getVariants = async (req, vehicleId) => {
  const { role, id } = req.user_data;

  const whereConditions = [`dlrinvn.vehicle_id = :vehicleId`];
  const queryParams = { vehicleId: vehicleId };

  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const query = `
  SELECT DISTINCT vvm.id, vv.variant_name
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm ON vvm.id = dlrinvn.vehicle_variant_map_id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} vv ON vv.id = vvm.vehicle_variant_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
    ${whereClause}
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(dlrinvn.id) OVER()::integer as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} dlrinvn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON dlrinvn.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm ON vvm.id = dlrinvn.vehicle_variant_map_id
    LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} vv ON vv.id = vvm.vehicle_variant_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = dlrinvn.dealer_id
    ${whereClause}
  `;

  const variants = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { variants, total: count?.total ?? 0 };
};

const getByChassisAndDealer = async (chassis_no, dealerId) => {
  return await DealerInventoryModel.findOne({
    where: { chassis_no: chassis_no, dealer_id: dealerId, status: "active" },
    raw: true,
  });
};

const getByVehicleColorId = async (req, vehicleColorId) => {
  const whereConditions = [
    "invnt.vehicle_color_id = :vehicle_color_id AND dlr.user_id = :userId",
  ];
  const queryParams = {
    vehicle_color_id: vehicleColorId,
    userId: req.user_data.id,
  };
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
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.DEALER_TABLE} as dlr ON dlr.id = invnt.dealer_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} as vclr ON vclr.id = invnt.vehicle_color_id 
    LEFT JOIN ${constants.models.DEALER_TABLE} as dlr ON dlr.id = invnt.dealer_id 
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getByVehicleId = async (req, vehicle_id) => {
  const whereConditions = ["invnt.vehicle_id = :vehicle_id"];
  const queryParams = { vehicle_id: vehicle_id };
  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(invnt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`invnt.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      *
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    ${whereClause}
    ORDER BY invnt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(invnt.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_INVENTORY_TABLE} invnt
    ${whereClause}
    ORDER BY invnt.created_at DESC
  `;

  const data = await DealerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerInventoryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getByVehicleAndDealer = async (vehicle_id, dealer_id) => {
  return await DealerInventoryModel.findOne({
    where: { vehicle_id: vehicle_id, dealer_id: dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });
};

const deleteByVehicleId = async (vehicle_id) => {
  return await DealerInventoryModel.destroy({
    where: { vehicle_id: vehicle_id },
  });
};

const deleteById = async (id) => {
  return await DealerInventoryModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  update: update,
  getById: getById,
  get: get,
  getChassis: getChassis,
  getByVehicleId: getByVehicleId,
  deleteByVehicleId: deleteByVehicleId,
  deleteById: deleteById,
  updateQuantity: updateQuantity,
  updateByDealerId: updateByDealerId,
  getByVehicleAndDealer: getByVehicleAndDealer,
  updateStatusByChassisNo: updateStatusByChassisNo,
  getColors: getColors,
  getVariants: getVariants,
  getByChassisAndDealer: getByChassisAndDealer,
  getByVehicleColorId: getByVehicleColorId,
};
