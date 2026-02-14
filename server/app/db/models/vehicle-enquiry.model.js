"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let VehicleEnquiryModel = null;

const init = async (sequelize) => {
  VehicleEnquiryModel = sequelize.define(
    constants.models.VEHICLE_ENQUIRY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_VARIANT_MAP_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      battery_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "accepted",
          "rejected",
          "delivered",
          "order-created",
        ]),
        defaultValue: "pending",
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_color_id"] },
        { fields: ["quantity"] },
        { fields: ["message"] },
      ],
    }
  );

  return VehicleEnquiryModel;
  await VehicleEnquiryModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await VehicleEnquiryModel.create(
    {
      dealer_id: req.body.dealer_id,
      vehicle_color_id: req.body.vehicle_color_id,
      vehicle_variant_map_id: req.body.vehicle_variant_map_id,
      quantity: req.body.quantity,
      message: req.body.message,
      battery_type: req.body.battery_type,
    },
    options
  );

  return data.dataValues;
};
const update = async (req, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await VehicleEnquiryModel.update(
    {
      status: req.body.status,
      remarks: req.body.remarks,
    },

    options
  );

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const { id, role } = req.user_data;
  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :userId");
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR usr.email ILIKE :query)`
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
    enq.*,
    vhc.id as vehicle_id, vhc.title, 
    vhclr.color_hex, vhclr.id as vehicle_color_id,
    usr.id as dealer_user_id, 
    CONCAT(usr.first_name, ' ', usr.last_name, ' (', dlr.location, ')') as dealership_name,
    vv.variant_name
  FROM ${constants.models.VEHICLE_ENQUIRY_TABLE} enq
  LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
  LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
  LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vhclr ON vhclr.id = enq.vehicle_color_id
  LEFT JOIN ${constants.models.VEHICLE_TABLE} vhc ON vhc.id = vhclr.vehicle_id
  LEFT JOIN ${constants.models.VEHICLE_VARIANT_MAP_TABLE} vvm ON vvm.id = enq.vehicle_variant_map_id
  LEFT JOIN ${constants.models.VEHICLE_VARIANT_TABLE} vv ON vv.id = vvm.vehicle_variant_id
  ${whereClause}
  GROUP BY enq.id, usr.id, vhc.id, dlr.location, vhclr.id, vv.variant_name
  ORDER BY usr.created_at DESC
  LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
        COUNT(enq.id) OVER()::integer as total
    FROM ${constants.models.VEHICLE_ENQUIRY_TABLE} enq
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
    ${whereClause}
  `;

  const enquiries = await VehicleEnquiryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await VehicleEnquiryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { enquiries, total: count?.total ?? 0 };
};
const getById = async (req, id) => {
  return await VehicleEnquiryModel.findOne({
    where: {
      id: req.params?.id || id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await VehicleEnquiryModel.destroy({
    where: { id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  deleteById: deleteById,
  get: get,
};
