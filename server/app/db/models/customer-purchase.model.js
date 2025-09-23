"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let CustomerPurchaseModel = null;

const init = async (sequelize) => {
  CustomerPurchaseModel = sequelize.define(
    constants.models.CUSTOMER_PURCHASE_TABLE,
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
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_VARIANT_MAP_TABLE,
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
      chassis_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "Chassis no. exist" },
      },
      invoices_bills: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      booking_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["vehicle_id"],
        },
        {
          fields: ["vehicle_color_id"],
        },
        {
          fields: ["customer_id"],
        },
        {
          fields: ["dealer_id"],
        },
        {
          fields: ["chassis_no"],
          unique: true,
        },
      ],
    }
  );

  await CustomerPurchaseModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await CustomerPurchaseModel.create(
    {
      vehicle_id: req.body.vehicle_id,
      vehicle_color_id: req.body.vehicle_color_id,
      vehicle_variant_map_id: req.body.vehicle_variant_map_id,
      customer_id: req.body.customer_id,
      dealer_id: req.body.dealer_id,
      chassis_no: req.body.chassis_no,
      invoices_bills: req.body.invoices_bills,
      booking_amount: req.body.booking_amount,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (data, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await CustomerPurchaseModel.bulkCreate(data, options);
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await CustomerPurchaseModel.update(
    { invoices_bills: req.body.invoices_bills },
    options
  );
};

const updateByCustomerId = async (req, id) => {
  return await CustomerPurchaseModel.update(
    { quantity: req.body.quantity },
    {
      where: { customer_id: id },
      returning: true,
      raw: true,
    }
  );
};

const getById = async (id) => {
  return await CustomerPurchaseModel.findOne({
    where: {
      id: id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const get = async (req) => {
  const { role, id } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :user_id");
    queryParams.user_id = id;
  }
  if (role === "customer") {
    whereConditions.push("cstmr.user_id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(
        vh.title ILIKE :query OR 
        cust_usr.first_name ILIKE :query OR 
        cust_usr.last_name ILIKE :query OR 
        cust_usr.mobile_number ILIKE :query OR 
        deal_usr.first_name ILIKE :query OR 
        deal_usr.last_name ILIKE :query OR 
        deal_usr.mobile_number ILIKE :query
      )`
    );
    queryParams.query = `%${q}%`;
  }

  const customer = req.query?.customer ?? null;
  if (customer) {
    whereConditions.push(`(cpt.customer_id = :customerId)`);
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
      cpt.id, cpt.chassis_no, cpt.invoices_bills,
      vh.id as vehicle_id, vh.title, vh.description, vh.category, vh.slug, vhclr.color_name as color, vhclr.color_hex, vh.carousel, vh.created_at,
      CONCAT(cust_usr.first_name, ' ', cust_usr.last_name) as customer_name, cust_usr.mobile_number as customer_phone,
      deal_usr.mobile_number as dealer_phone,
      CONCAT(deal_usr.first_name, ' ', deal_usr.last_name, ' (', dlr.location, ')') AS dealership
    FROM ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON cpt.vehicle_id = vh.id
    LEFT JOIN LATERAL (
      SELECT color_name, color_hex 
      FROM ${constants.models.VEHICLE_COLOR_TABLE} vc 
      WHERE vc.vehicle_id = cpt.vehicle_id 
      LIMIT 1
    ) vhclr ON true
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cstmr ON cstmr.id = cpt.customer_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cpt.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} cust_usr ON cust_usr.id = cstmr.user_id
    LEFT JOIN ${constants.models.USER_TABLE} deal_usr ON deal_usr.id = dlr.user_id
    ${whereClause}
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(cpt.id) OVER()::integer as total
    FROM ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON cpt.vehicle_id = vh.id
    LEFT JOIN LATERAL (
      SELECT color_name, color_hex 
      FROM ${constants.models.VEHICLE_COLOR_TABLE} vc 
      WHERE vc.vehicle_id = cpt.vehicle_id 
      LIMIT 1
    ) vhclr ON true
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cstmr ON cstmr.id = cpt.customer_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cpt.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} cust_usr ON cust_usr.id = cstmr.user_id
    LEFT JOIN ${constants.models.USER_TABLE} deal_usr ON deal_usr.id = dlr.user_id
    ${whereClause}
  `;

  const inventory = await CustomerPurchaseModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerPurchaseModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory, total: count?.total ?? 0 };
};

const getByVehicleId = async (req, vehicle_id) => {
  const whereConditions = ["cpt.vehicle_id = :vehicle_id"];
  const queryParams = { vehicle_id: vehicle_id };
  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(`(cpt.chassis_no ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      *
    FROM ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt
    ${whereClause}
    ORDER BY cpt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(cpt.id) OVER()::INTEGER as total
    FROM ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt
    ${whereClause}
    ORDER BY cpt.created_at DESC
  `;

  const data = await CustomerPurchaseModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerPurchaseModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory: data, total: count?.total ?? 0 };
};

const getByVehicleAndCustomer = async (vehicle_id, customer_id) => {
  return await CustomerPurchaseModel.findOne({
    where: { vehicle_id: vehicle_id, customer_id: customer_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });
};

const deleteByVehicleId = async (vehicle_id) => {
  return await CustomerPurchaseModel.destroy({
    where: { vehicle_id: vehicle_id },
  });
};

const deleteById = async (id) => {
  return await CustomerPurchaseModel.destroy({
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
  getByVehicleId: getByVehicleId,
  deleteByVehicleId: deleteByVehicleId,
  deleteById: deleteById,
  updateByCustomerId: updateByCustomerId,
  getByVehicleAndCustomer: getByVehicleAndCustomer,
};
