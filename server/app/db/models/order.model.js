"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;
import { format, subDays, eachDayOfInterval } from "date-fns";

let OrderModel = null;

const init = async (sequelize) => {
  OrderModel = sequelize.define(
    constants.models.ORDER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      // vehicle_id: {
      //   type: DataTypes.UUID,
      //   allowNull: false,
      //   references: {
      //     model: constants.models.VEHICLE_TABLE,
      //     key: "id",
      //     deferrable: Deferrable.INITIALLY_IMMEDIATE,
      //   },
      //   onDelete: "CASCADE",
      // },
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      punch_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "in process",
          "dispatched",
          "out for delivery",
          "delivered",
        ]),
        defaultValue: "pending",
      },
      message: {
        type: DataTypes.TEXT,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["user_id"] },
        { fields: ["order_code"] },
        { fields: ["status"] },
      ],
    }
  );

  await OrderModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const { id, role } = req.user_data;

  const latest = await OrderModel.findOne({
    attributes: ["order_code"],
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newOrdCode = "ORD-0001";

  if (latest?.order_code) {
    const number = parseInt(latest.order_code.split("-")[1]);
    const nextNumber = number + 1;
    newOrdCode = `ORD-${String(nextNumber).padStart(4, "0")}`;
  }

  const options = {};
  if (transaction) options.transaction = transaction;

  return await OrderModel.create(
    {
      order_code: newOrdCode,
      user_id: id,
      punch_by: role,
      dealer_id: req.body.dealer_id,
      vehicle_id: req.body.vehicle_id,
      message: req.body.message,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};
  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :userId");
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query))`
    );
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length > 0) {
    whereClause = "WHERE " + whereConditions.join(" AND ");
  }

  let countQuery = `
    SELECT
        COUNT(ord.id) OVER()::integer as total
      FROM ${constants.models.ORDER_TABLE} ord
      LEFT JOIN ${constants.models.USER_TABLE} punchusr ON punchusr.id = ord.user_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
      ${whereClause}
    `;

  let query = `
    SELECT
        ord.*
      FROM ${constants.models.ORDER_TABLE} ord
      LEFT JOIN ${constants.models.USER_TABLE} punchusr ON punchusr.id = ord.user_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
      ${whereClause}
      ORDER BY ord.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await OrderModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await OrderModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { orders: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await OrderModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await OrderModel.update(
    { status: req.body.status, user_id: req.body.user_id },
    options
  );
};

const deleteById = async (req, id) => {
  return await OrderModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
