"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let QuotationModel = null;

const init = async (sequelize) => {
  QuotationModel = sequelize.define(
    constants.models.QUOTATION_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      enquiry_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: { args: true, msg: "Quotation generated already." },
        references: {
          model: constants.models.WALKIN_ENQUIRY_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "SET NULL",
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quotation_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dealer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.DEALER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "SET NULL",
      },
      vehicle_ids: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: [],
      },
      vehicle_price_breakups: {
        type: DataTypes.JSONB,
        defaultValue: [], //[{model, base_price_ex_showroom, gst, insurance, rto_registration_charges, accessories_fitments, total_ex_showroom_price, discount, on_road_price}]
      },
      status: {
        type: DataTypes.ENUM(["pending", "invoice-generated"]),
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["dealer_id"] },
        { fields: ["vehicle_ids"] },
        { fields: ["customer_name"] },
        { fields: ["mobile_no"] },
        { fields: ["date"] },
        { fields: ["quotation_no"] },
      ],
    }
  );

  await QuotationModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const dealerCode = req.body.dealer_code;
  const latest = await QuotationModel.findOne({
    attributes: ["quotation_no"],
    where: { dealer_id: req.body.dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newQuotationNo = `${dealerCode}-QT-0001`;
  if (latest?.quotation_no) {
    const parts = latest.quotation_no.split("-");
    const lastNumber = parseInt(parts[parts.length - 1], 10); // take the last block
    const nextNumber = lastNumber + 1;
    newQuotationNo = `${dealerCode}-QT-${String(nextNumber).padStart(4, "0")}`;
  }

  const data = await QuotationModel.create(
    {
      enquiry_id: req.body.enquiry_id,
      customer_name: req.body.customer_name,
      mobile_no: req.body.mobile_no,
      date: req.body.date,
      quotation_no: newQuotationNo,
      dealer_id: req.body.dealer_id,
      vehicle_price_breakups: req.body.vehicle_price_breakups,
      vehicle_ids: req.body.vehicle_ids,
      message: req.body.message,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await QuotationModel.update(
    {
      customer_name: req.body.customer_name,
      mobile_no: req.body.mobile_no,
      date: req.body.date,
      dealer_id: req.body.dealer_id,
      vehicle_price_breakups: req.body.vehicle_price_breakups,
      vehicle_ids: req.body.vehicle_ids,
      message: req.body.message,
    },
    options
  );
};

const getById = async (id) => {
  return await QuotationModel.findOne({
    where: {
      id: id,
    },
    raw: true,
  });
};

const get = async (req) => {
  const { role, id } = req.user_data;

  const whereConditions = [];
  const queryParams = {};

  if (role === "dealer") {
    whereConditions.push("dlr.user_id = :user_id");
    queryParams.user_id = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(
        qt.customer_name ILIKE :query OR
        qt.mobile_no ILIKE :query OR
        qt.quotation_no ILIKE :query
      )`
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
      qt.*,
      COALESCE(JSON_AGG(vh.title) FILTER (WHERE vh.title IS NOT NULL), '[]') AS vehicles
    FROM ${constants.models.QUOTATION_TABLE} qt
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ANY(qt.vehicle_ids::uuid[])
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = qt.dealer_id
    ${whereClause}
    GROUP BY qt.id
    ORDER BY qt.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(qt.id) OVER()::integer as total
    FROM ${constants.models.QUOTATION_TABLE} qt
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = qt.dealer_id
    ${whereClause}
  `;

  const quotations = await QuotationModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await QuotationModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { quotations, total: count?.total ?? 0 };
};

const deleteById = async (id) => {
  return await QuotationModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  get: get,
  deleteById: deleteById,
};
