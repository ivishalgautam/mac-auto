"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let InvoiceModel = null;

const init = async (sequelize) => {
  InvoiceModel = sequelize.define(
    constants.models.INVOICE_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: { args: true, msg: "Invoice generated already." },
        references: {
          model: constants.models.QUOTATION_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "SET NULL",
      },
      // customer_name: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // mobile_no: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.CUSTOMER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "SET NULL",
      },
      date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["customer_id"] },
        { fields: ["dealer_id"] },
        { fields: ["vehicle_ids"] },
        { fields: ["date"] },
        { fields: ["invoice_no"] },
      ],
    }
  );

  return InvoiceModel;
  await InvoiceModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const latest = await InvoiceModel.findOne({
    attributes: ["invoice_no"],
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newQuotationNo = `INV-0001`;
  if (latest?.invoice_no) {
    const parts = latest.invoice_no.split("-");
    const lastNumber = parseInt(parts[parts.length - 1], 10); // take the last block
    const nextNumber = lastNumber + 1;
    newQuotationNo = `INV-${String(nextNumber).padStart(4, "0")}`;
  }

  const data = await InvoiceModel.create(
    {
      quotation_id: req.body.quotation_id,
      customer_id: req.body.customer_id,
      // customer_name: req.body.customer_name,
      // mobile_no: req.body.mobile_no,
      date: req.body.date,
      invoice_no: newQuotationNo,
      dealer_id: req.body.dealer_id,
      vehicle_price_breakups: req.body.vehicle_price_breakups,
      vehicle_ids: req.body.vehicle_ids,
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
  return await InvoiceModel.update(
    {
      customer_id: req.body.customer_id,
      // customer_name: req.body.customer_name,
      // mobile_no: req.body.mobile_no,
      date: req.body.date,
      dealer_id: req.body.dealer_id,
      vehicle_price_breakups: req.body.vehicle_price_breakups,
      vehicle_ids: req.body.vehicle_ids,
    },
    options
  );
};

const getById = async (id) => {
  let query = `
  SELECT 
      inv.*,
      CONCAT(cstusr.first_name, ' ', COALESCE(cstusr.last_name, '')) as customer_name,
      cstusr.mobile_number as mobile_no,
      cst.address
    FROM ${constants.models.INVOICE_TABLE} inv
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = inv.customer_id
    LEFT JOIN ${constants.models.USER_TABLE} cstusr ON cstusr.id = cst.user_id
    WHERE inv.id = :id
  `;

  return await InvoiceModel.sequelize.query(query, {
    replacements: { id: id },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
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
        cstusr.first_name ILIKE :query OR
        cstusr.mobile_number ILIKE :query OR
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
      inv.id, inv.invoice_no, inv.date, inv.created_at,
      CONCAT(cstusr.first_name, ' ', COALESCE(cstusr.last_name, '')) as customer_name,
      cstusr.mobile_number as mobile_no,
      COALESCE(JSON_AGG(vh.title) FILTER (WHERE vh.title IS NOT NULL), '[]') AS vehicles
    FROM ${constants.models.INVOICE_TABLE} inv
    LEFT JOIN LATERAL (
      SELECT dlr_inv.vehicle_id
      FROM ${constants.models.DEALER_INVENTORY_TABLE} dlr_inv
      WHERE dlr_inv.id = ANY(inv.vehicle_ids::uuid[])
    ) dlrinv ON true
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = dlrinv.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = inv.dealer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = inv.customer_id
    LEFT JOIN ${constants.models.USER_TABLE} cstusr ON cstusr.id = cst.user_id
    ${whereClause}
    GROUP BY inv.id, cstusr.first_name, cstusr.last_name, cstusr.mobile_number
    ORDER BY inv.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT COUNT(DISTINCT inv.id)::integer AS total
    FROM ${constants.models.INVOICE_TABLE} inv
    LEFT JOIN LATERAL (
      SELECT dlr_inv.vehicle_id
      FROM ${constants.models.DEALER_INVENTORY_TABLE} dlr_inv
      WHERE dlr_inv.id = ANY(inv.vehicle_ids::uuid[])
    ) dlrinv ON true
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = dlrinv.vehicle_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = inv.dealer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = inv.customer_id
    LEFT JOIN ${constants.models.USER_TABLE} cstusr ON cstusr.id = cst.user_id
    ${whereClause}
  `;

  const invoices = await InvoiceModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await InvoiceModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { invoices, total: count?.total ?? 0 };
};

const deleteById = async (id) => {
  return await InvoiceModel.destroy({
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
