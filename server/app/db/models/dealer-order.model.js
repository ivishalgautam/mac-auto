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
        type: DataTypes.ENUM("in process", "dispatch", "canceled", "delivered"),
        allowNull: false,
        defaultValue: "in process",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["dealer_id"] },
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
      dealer_id: req.body.dealer_id,
      chassis_nos: req.body.chassis_numbers,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id) => {
  return await DealerOrderModel.update(
    { status: req.body.status },
    {
      where: { id: req?.params?.id || id },
      returning: true,
      raw: true,
    }
  );
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
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
  SELECT DISTINCT ON (ord.id)
      ord.*,
      CONCAT(usr.first_name, ' ', usr.last_name) as dealer_name,
      vh.title as vehicle_title, vh.color,
      JSON_AGG(JSON_BUILD_OBJECT('no', invnt.chassis_no)) as chassis_nos
    FROM ${constants.models.DEALER_ORDER_TABLE} ord
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.id = ANY(ord.chassis_nos::uuid[])
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ord.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = ord.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
    ${whereClause}
    GROUP BY ord.id, usr.first_name, usr.last_name, vh.title, vh.color
    LIMIT :limit OFFSET :offset
  `;

  let countQuery = `
  SELECT
      COUNT(ord.id) OVER()::INTEGER as total
    FROM ${constants.models.DEALER_ORDER_TABLE} ord
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

const getById = async (req, id) => {
  return await DealerOrderModel.findOne({
    where: { id: req?.params?.id || id },
  });
};

const deleteById = async (id) => {
  return await DealerOrderModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  deleteById: deleteById,
  getById: getById,
};
