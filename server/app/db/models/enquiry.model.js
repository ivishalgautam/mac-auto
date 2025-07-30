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
      dealer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.DEALER_TABLE,
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
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "in process",
          "converted",
          "dealer assigned",
        ]),
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["dealer_id"] },
        { fields: ["vehicle_id"] },
        { fields: ["quantity"] },
        { fields: ["message"] },
        { fields: ["name"] },
        { fields: ["email"] },
        { fields: ["phone"] },
        { fields: ["location"] },
        { fields: ["status"] },
      ],
    }
  );

  await EnquiryModel.sync({ alter: true });
};

const create = async (req) => {
  return await EnquiryModel.create({
    dealer_id: req.body.dealer_id,
    vehicle_id: req.body.vehicle_id,
    quantity: req.body.quantity,
    message: req.body.message,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    location: req.body.location,
  });
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};
  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push(`dlr.user_id = :userId`);
    queryParams.userId = id;
  }

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
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      ${whereClause}
      `;

  let query = `
      SELECT
        enq.*, vh.title as vehicle_name
      FROM ${constants.models.ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
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
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await EnquiryModel.update(
    { status: req.body.status, dealer_id: req.body.dealer_id },
    options
  );
};

const deleteById = async (req, id) => {
  return await EnquiryModel.destroy({
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
