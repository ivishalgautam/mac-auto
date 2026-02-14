"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, Op, QueryTypes } from "sequelize";

let CustomerInventoryModel = null;

const init = async (sequelize) => {
  CustomerInventoryModel = sequelize.define(
    constants.models.CUSTOMER_INVENTORY_TABLE,
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
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.CUSTOMER_TABLE,
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
        allowNull: false,
      },
      battery_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      controller_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      charger_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_id"] },
        {
          fields: ["chassis_no"],
          unique: true,
        },
      ],
    }
  );

  // return CustomerInventoryModel;
  await CustomerInventoryModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await CustomerInventoryModel.create(
    {
      customer_id: req.body.customer_id,
      vehicle_id: req.body.vehicle_id,
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

  const newRecord = await CustomerInventoryModel.bulkCreate(data, options);
  return newRecord.map((item) => item.dataValues);
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await CustomerInventoryModel.update(
    {
      vehicle_id: req.body.vehicle_id,
      customer_id: req.body.customer_id,
      chassis_no: req.body.chassis_no,
      motor_no: req.body.motor_no,
      battery_no: req.body.battery_no,
      controller_no: req.body.controller_no,
      charger_no: req.body.charger_no,
    },
    options
  );
};

const getById = async (req, id) => {
  const query = `
    SELECT 
        invn.*,
        cust.user_id as customer_user_id
    FROM ${constants.models.CUSTOMER_INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cust ON cust.id = invn.customer_id
    WHERE invn.id = :id
    
  `;

  return await CustomerInventoryModel.sequelize.query(query, {
    replacements: { id: req.params?.id || id },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });
};

const get = async (req) => {
  const { role, id } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  if (role === "customer") {
    whereConditions.push("cust.user_id = :userId");
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(
        vh.title ILIKE :query OR
        invn.chassis_no ILIKE :query OR
        invn.motor_no ILIKE :query OR
        invn.battery_no ILIKE :query OR
        invn.controller_no ILIKE :query OR
        invn.charger_no ILIKE :query
    )`);
    queryParams.query = `%${q}%`;
  }

  const customer = req.query?.customer ?? null;
  if (customer) {
    whereConditions.push(`(invn.customer_id = :customerId)`);
    queryParams.customerId = customer;
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
        invn.*,
        vh.title
    FROM ${constants.models.CUSTOMER_INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = invn.vehicle_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cust ON cust.id = invn.customer_id
    ${whereClause}
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(invn.id) AS total
    FROM ${constants.models.CUSTOMER_INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = invn.vehicle_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cust ON cust.id = invn.customer_id
    ${whereClause}
  `;

  const inventory = await CustomerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerInventoryModel.sequelize.query(countQuery, {
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

const getByCustomer = async (req, customerId) => {
  const { role, id } = req.user_data;

  const whereConditions = [`invn.customer_id = :customerId`];
  const queryParams = { customerId: req.params?.id || customerId };

  if (role === "customer") {
    whereConditions.push("cust.user_id = :userId");
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(
        vh.title ILIKE :query OR
        invn.chassis_no ILIKE :query OR
        invn.motor_no ILIKE :query OR
        invn.battery_no ILIKE :query OR
        invn.controller_no ILIKE :query OR
        invn.charger_no ILIKE :query
    )`);
    queryParams.query = `%${q}%`;
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
        invn.*
    FROM ${constants.models.CUSTOMER_INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = invn.vehicle_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cust ON cust.id = invn.customer_id
    ${whereClause}
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(invn.id) AS total
    FROM ${constants.models.CUSTOMER_INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = invn.vehicle_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cust ON cust.id = invn.customer_id
    ${whereClause}
  `;

  const inventory = await CustomerInventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerInventoryModel.sequelize.query(countQuery, {
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

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  update: update,
  getById: getById,
  get: get,
  getByCustomer: getByCustomer,
};
