"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let CustomerModel = null;

const init = async (sequelize) => {
  CustomerModel = sequelize.define(
    constants.models.CUSTOMER_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["user_id"] }],
    }
  );

  await CustomerModel.sync({ alter: true });
};

const create = async (user_id, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await CustomerModel.create({ user_id: user_id }, options);

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;

  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR usr.email ILIKE :query OR usr.mobile_number ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  const dealers = req.query?.dealers ? req.query.dealers.split(".") : null;
  if (dealers) {
    whereConditions.push(`cstdlr.dealer_id = ANY(:dealers)`);
    queryParams.dealers = `{${dealers.join(",")}}`;
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
      cst.*,
      dlrusr.id as dealer_user_id, 
      CASE WHEN dlrusr.id IS NOT NULL 
        THEN CONCAT(dlrusr.first_name, ' ', dlrusr.last_name) 
        ELSE '-' END as dealership,
      usr.id as user_id, CONCAT(usr.first_name, ' ', usr.last_name) as fullname,
      usr.mobile_number, usr.email, usr.username,
      COUNT(cpt.id) as total_purchases
    FROM ${constants.models.CUSTOMER_TABLE} cst
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = cst.user_id
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.customer_id = cst.id
    LEFT JOIN ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlr ON cstdlr.customer_id = cst.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlr.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
    ${whereClause}
    GROUP BY cst.id, usr.id, dlrusr.id
    ORDER BY usr.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(cst.id) OVER()::integer as total
    FROM ${constants.models.CUSTOMER_TABLE} cst
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = cst.user_id
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.customer_id = cst.id
    LEFT JOIN ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlr ON cstdlr.customer_id = cst.id
  ${whereClause}
  `;

  const customers = await CustomerModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CustomerModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { customers, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await CustomerModel.findOne({
    where: { id: req.params?.id || id },
  });
};

const deleteById = async (req, id, transaction) => {
  return await CustomerModel.destroy({
    where: { id: req.params?.id || id },
    transaction,
  });
};

const getByUserId = async (req, id) => {
  return await CustomerModel.findOne({
    where: { user_id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
  getByUserId: getByUserId,
};
