"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let EnquiryModel = null;

const init = async (sequelize) => {
  EnquiryModel = sequelize.define(
    constants.models.ENQUIRY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
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
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          max: 2147483647,
          min: -2147483648,
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["quantity"] },
        { fields: ["message"] },
        { fields: ["name"] },
        { fields: ["email"] },
        { fields: ["phone"] },
      ],
    }
  );

  await EnquiryModel.sync({ alter: true });
};

const create = async (req) => {
  return await EnquiryModel.create({
    vehicle_id: req.body.vehicle_id,
    quantity: req.body.quantity,
    message: req.body.message,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  });
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
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
        COUNT(enq.id) OVER()::integer as total
      FROM ${constants.models.ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      ${whereClause}
      `;

  let query = `
      SELECT
        enq.*, vh.title as vehicle_name
      FROM ${constants.models.ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      ${whereClause}
      ORDER BY enq.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await EnquiryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await EnquiryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
  });

  return { enquiries: data, total: count?.[0]?.total ?? 0 };
};

const getById = async (req, id) => {
  return await EnquiryModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id) => {
  return await EnquiryModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
