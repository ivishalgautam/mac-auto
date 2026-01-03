"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, Op, QueryTypes } from "sequelize";
import table from "../../db/models.js";

let CustomerDealersModel = null;

const init = async (sequelize) => {
  CustomerDealersModel = sequelize.define(
    constants.models.CUSTOMER_DEALERS_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["customer_id"] }, { fields: ["dealer_id"] }],
    }
  );

  await CustomerDealersModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await CustomerDealersModel.create(
    {
      customer_id: req.body.customer_id,
      dealer_id: req.body.dealer_id,
    },
    options
  );

  return data.dataValues;
};

const getByCustomerAndDealer = async (req, transaction) => {
  return await CustomerDealersModel.findOne({
    where: {
      customer_id: req.body.customer_id,
      dealer_id: req.body.dealer_id,
    },
    raw: true,
  });
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const { role, id } = req.user_data;

  if (role === "dealer") {
    whereConditions.push(`dlr.user_id = :userId`);
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR usr.email ILIKE :query OR usr.mobile_number ILIKE :query)`
    );
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
    cstdlrs.*,
    usr.id as user_id, CONCAT(usr.first_name, ' ', usr.last_name) as fullname,
    usr.mobile_number, usr.email,
    COUNT(cpt.id) as total_purchases
  FROM ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlrs
  LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cstdlrs.customer_id
  LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = cst.user_id
  LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlrs.dealer_id
  LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.customer_id = cstdlrs.customer_id
  ${whereClause}
  GROUP BY cstdlrs.id, usr.id
  ORDER BY cstdlrs.created_at DESC
  LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
    COUNT(cstdlrs.id) OVER()::integer as total
  FROM ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlrs
  LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cstdlrs.customer_id
  LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = cst.user_id
  LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlrs.dealer_id
  ${whereClause}
  `;

  const customers = await CustomerDealersModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerDealersModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { customers, total: count?.total ?? 0 };
};

const deleteById = async (id) => {
  return await CustomerDealersModel.destroy({
    where: { id: id },
  });
};

const count = async (req, last_30_days = false) => {
  const { id } = req.user_data;
  const whereConditions = ["dlr.user_id = :userId"];
  const queryParams = { userId: id };

  if (last_30_days) {
    whereConditions.push("cd.created_at >= :createdAfter");
    queryParams.createdAfter = moment()
      .subtract(30, "days")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      COUNT(cd.id)
    FROM ${constants.models.CUSTOMER_DEALERS_TABLE} cd
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cd.dealer_id
    ${whereClause} 
  `;

  const { count } = await CustomerDealersModel.sequelize.query(query, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return count;
};

export default {
  init: init,
  create: create,
  get: get,
  deleteById: deleteById,
  getByCustomerAndDealer: getByCustomerAndDealer,
  count: count,
};
