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
        //punch by user id
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
          "cancel",
        ]),
        defaultValue: "pending",
      },
      message: {
        type: DataTypes.TEXT,
      },
      oc_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      driver_details: {
        type: DataTypes.JSONB, // {driver_name, vehicle_number, phone}
        allowNull: true,
      },
      invoice: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      pdi: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      e_way_bill: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["order_code"] },
        { fields: ["status"] },
        { fields: ["oc_number"] },
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
    paranoid: false,
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
      oc_number: req.body.oc_number,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = ["ord.deleted_at IS NULL"];
  const queryParams = {};
  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :userId");
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(ord.order_code ILIKE :query OR usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR dlr.location ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  const status = req.query.status ? req.query.status.split(".") : null;
  if (status?.length) {
    whereConditions.push(`ord.status = any(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const dealers = req.query.dealers ? req.query.dealers.split(".") : null;
  if (dealers?.length) {
    whereConditions.push(`ord.dealer_id = any(:dealers)`);
    queryParams.dealers = `{${dealers.join(",")}}`;
  }

  const startDate = req.query.start_date || null;
  const endDate = req.query.end_date || null;
  if (startDate && endDate) {
    whereConditions.push(
      `(ord.created_at::date >= :startDate AND ord.created_at::date <= :endDate)`
    );
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  } else if (startDate) {
    whereConditions.push(`ord.created_at::date >= :startDate`);
    queryParams.startDate = startDate;
  } else if (endDate) {
    whereConditions.push(`ord.created_at::date <= :endDate`);
    queryParams.endDate = endDate;
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
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ${whereClause}
    `;

  let query = `
    SELECT
        ord.id, ord.order_code, ord.punch_by, ord.status, ord.message, ord.created_at, ord.oc_number, ord.deleted_at,
        CONCAT(usr.first_name, ' ', COALESCE(usr.last_name, ''), ' (', dlr.location, ')') as dealership_name,
        ordst.created_at as status_updated_at
      FROM ${constants.models.ORDER_TABLE} ord
      LEFT JOIN ${constants.models.USER_TABLE} punchusr ON punchusr.id = ord.user_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      LEFT JOIN ${constants.models.ORDER_STATUS_TABLE} ordst ON ordst.order_id = ord.id AND ordst.status::text = ord.status::text
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
  let query = `
  SELECT
      ord.*,
      CONCAT(usr.first_name, ' ', usr.last_name) as dealer_name,
      COALESCE(JSON_AGG(ordst.*) FILTER (WHERE ordst.id IS NOT NULL), '[]') as status_updates
    FROM ${constants.models.ORDER_TABLE} ord
    LEFT JOIN ${constants.models.ORDER_STATUS_TABLE} ordst ON ordst.order_id = ord.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
    WHERE ord.id = :orderId
    GROUP BY ord.id, usr.first_name, usr.last_name
  `;

  return await OrderModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { orderId: req.params?.id || id },
    raw: true,
    plain: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
    returning: true,
    plain: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;

  const [, rows] = await OrderModel.update(
    {
      oc_number: req.body.oc_number,
      message: req.body.message,
      status: req.body.status,
      driver_details: req.body.driver_details,
      invoice: req.body.invoice,
      pdi: req.body.pdi,
      e_way_bill: req.body.e_way_bill,
    },
    options
  );

  return rows;
};

const deleteById = async (req, id) => {
  return await OrderModel.destroy({
    where: { id: req.params.id || id },
  });
};

const forceDeleteById = async (req, id) => {
  return await OrderModel.destroy({
    where: { id: req.params.id || id },
    force: true,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
  forceDeleteById: forceDeleteById,
};
