"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let DealerOrderModel = null;
const init = async (sequelize) => {
  DealerOrderModel = sequelize.define(
    constants.models.DEALER_ORDER_TABLE,
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
      chassis_nos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "in process",
          "pdi",
          "dispatch",
          "canceled",
          "delivered"
        ),
        allowNull: false,
        defaultValue: "in process",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["vehicle_color_id"] },
        { fields: ["dealer_id"] },
        { fields: ["chassis_nos"] },
        { fields: ["status"] },
      ],
    }
  );

  await DealerOrderModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await DealerOrderModel.create(
    {
      vehicle_id: req.body.vehicle_id,
      vehicle_color_id: req.body.vehicle_color_id,
      dealer_id: req.body.dealer_id,
      chassis_nos: req.body.chassis_numbers,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req?.params?.id || id },
    returning: true,
    raw: true,
  };

  if (transaction) options.transaction = transaction;

  return await DealerOrderModel.update({ status: req.body.status }, options);
};

const get = async (req) => {
  const { id, role } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  if (role === "dealer") {
    whereConditions.push(`dlr.user_id = :userId`);
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  const status = req.query?.status?.split(".") ?? null;

  if (q) {
    whereConditions.push(`(ord.chassis_nos && :query)`);
    queryParams.query = `%${q}%`;
  }

  if (status && status.length) {
    whereConditions.push(`ord.status = ANY(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  let query = `
  SELECT
      ord.*,
      CONCAT(usr.first_name, ' ', usr.last_name, ' (', dlr.location, ')') AS dealer_name,
      vh.title AS vehicle_title,
      vhclr.color_hex as color,
      ord.chassis_nos,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', pdi.id,
          'pdi', pdi.pdi,
          'pdi_by', JSONB_BUILD_OBJECT(
            'id', pdiusr.id,
            'name', CONCAT(pdiusr.first_name, ' ', pdiusr.last_name),
            'role', pdiusr.role
          )
        ))
        FILTER (WHERE pdi.id IS NOT NULL),
        '[]'
      ) AS pdi_checks
    FROM ${constants.models.DEALER_ORDER_TABLE} ord
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.chassis_no = ANY(ord.chassis_nos)
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ord.vehicle_id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON vhclr.id = ord.vehicle_color_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
    LEFT JOIN ${constants.models.PDI_CHECK_TABLE} pdi ON pdi.dealer_order_id = ord.id
    LEFT JOIN ${constants.models.USER_TABLE} pdiusr ON pdiusr.id = pdi.pdi_by
    ${whereClause}
    GROUP BY ord.id, usr.first_name, usr.last_name, vh.title, vhclr.color_hex, dlr.location
    ORDER BY ord.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(ord.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_ORDER_TABLE} ord
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.chassis_no = ANY(ord.chassis_nos)
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ord.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
    ${whereClause}
    ORDER BY ord.created_at DESC
  `;

  const data = await DealerOrderModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerOrderModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { orders: data, total: count?.total ?? 0 };
};

const getChassisDetailsOfOrder = async (req, id) => {
  let query = `
  SELECT
      ord.id,
      vh.title as vehicle_title, vhclr.color_name, vhclr.color_hex,
      invnt.id as inventory_id, invnt.chassis_no, invnt.motor_no, invnt.battery_no, invnt.controller_no, invnt.charger_no
    FROM ${constants.models.DEALER_ORDER_TABLE} ord
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.chassis_no = ANY(ord.chassis_nos)
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ord.vehicle_id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON vhclr.id = ord.vehicle_color_id
    WHERE ord.id = :order_id
    GROUP BY ord.id, vh.title, invnt.id, vhclr.color_name, vhclr.color_hex
  `;

  return await DealerOrderModel.sequelize.query(query, {
    replacements: { order_id: req.params?.id || id },
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (req, id) => {
  return await DealerOrderModel.findOne({
    where: { id: req?.params?.id || id },
    raw: true,
  });
};

const deleteById = async (req, id, transaction) => {
  const options = {
    where: { id: req?.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await DealerOrderModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  deleteById: deleteById,
  getById: getById,
  getChassisDetailsOfOrder: getChassisDetailsOfOrder,
};
