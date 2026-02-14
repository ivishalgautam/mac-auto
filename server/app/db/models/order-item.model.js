"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let OrderItemModel = null;
const init = async (sequelize) => {
  OrderItemModel = sequelize.define(
    constants.models.ORDER_ITEM_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.ORDER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
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
      // battery_type: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // store multiple colors and their quantities as JSON
      colors: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          isArrayOfObjects(value) {
            if (!Array.isArray(value)) {
              throw new Error("Colors must be an array");
            }
            value.forEach((v) => {
              if (
                typeof v !== "object" ||
                !v.color ||
                typeof v.color !== "string" ||
                typeof v.quantity !== "number"
              ) {
                throw new Error(
                  "Each color entry must have a 'color' (string) and 'quantity' (number)"
                );
              }
            });
          },
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "updated"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["order_id"] }, { fields: ["vehicle_id"] }],
    }
  );

  return OrderItemModel;
  await OrderItemModel.sync({ alter: true });
};

const create = async (req) => {
  return await OrderItemModel.create({
    order_id: req.body.order_id,
    vehicle_id: req.body.vehicle_id,
    // battery_type: req.body.battery_type,
    color: req.body.color,
    variant: req.body.variant,
    quantity: req.body.quantity,
  });
};

const bulkCreate = async (data, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await OrderItemModel.bulkCreate(data, options);
};

const getById = async (req, id) => {
  return await OrderItemModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id) => {
  return await OrderItemModel.update(
    { colors: req.body.colors, status: req.body.status },
    {
      where: { id: req.params?.id || id },
      raw: true,
    }
  );
};

const deleteById = async (req, id) => {
  return await OrderItemModel.destroy({
    where: { id: req.params.id || id },
  });
};

const deleteByOrderId = async (order_id, transaction) => {
  return await OrderItemModel.destroy({
    where: { order_id: order_id },
    transaction,
  });
};

const getByOrderId = async (req, orderId) => {
  const whereConditions = [`oi.order_id = :orderId`];
  const queryParams = { orderId: req?.params?.id || orderId };

  // const { role, id } = req.user_data;
  // if (role === "user") {
  //   whereConditions.push(`oi.user_id = :userId`);
  //   queryParams.userId = id;
  // }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push();
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
      oi.id, oi.created_at, oi.status,
      jsonb_agg(
        jsonb_build_object(
          'color', elem->>'color',
          'battery_type', elem->>'battery_type',
          'quantity', elem->>'quantity',
          'details', elem->'details',
          'vehicle_color_id', vhclr.id
        )
      ) AS colors,
      vh.id as vehicle_id, vh.title, vh.category
    FROM ${constants.models.ORDER_ITEM_TABLE} oi
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = oi.vehicle_id
    LEFT JOIN LATERAL jsonb_array_elements(oi.colors) elem ON TRUE
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON vhclr.vehicle_id = vh.id AND LOWER(vhclr.color_name) = LOWER(elem->>'color')
    ${whereClause}
    GROUP BY oi.id,  oi.created_at, vh.id, vh.title, oi.status
    ORDER BY oi.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(oi.id) OVER()::integer as total
    FROM ${constants.models.ORDER_ITEM_TABLE} oi
    ${whereClause}
  `;

  const items = await OrderItemModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await OrderItemModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { items, total: count?.total ?? 0 };
};

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  getById: getById,
  update: update,
  deleteById: deleteById,
  deleteByOrderId: deleteByOrderId,
  getByOrderId: getByOrderId,
};
