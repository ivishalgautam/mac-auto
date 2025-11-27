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
      enquiry_id: {
        type: DataTypes.UUID,
        unique: { args: true, msg: "Invoice generated already." },
        allowNull: false,
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
      invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      variant: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
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
      // vehicle_ids: {
      //   type: DataTypes.UUID,
      //   allowNull: false,
      //   references: {
      //     model: constants.models.VEHICLE_TABLE,
      //     key: "id",
      //     deferrable: Deferrable.INITIALLY_IMMEDIATE,
      //   },
      //   onDelete: "SET NULL",
      // },
      vehicle_ids: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: [],
      },
      // vehicle_variant_map_id: {
      //   type: DataTypes.UUID,
      //   allowNull: true,
      //   references: {
      //     model: constants.models.VEHICLE_VARIANT_MAP_TABLE,
      //     key: "id",
      //     deferrable: Deferrable.INITIALLY_IMMEDIATE,
      //   },
      //   onDelete: "SET NULL",
      // },
      // vehicle_color_id: {
      //   type: DataTypes.UUID,
      //   allowNull: false,
      //   references: {
      //     model: constants.models.VEHICLE_COLOR_TABLE,
      //     key: "id",
      //     deferrable: Deferrable.INITIALLY_IMMEDIATE,
      //   },
      //   onDelete: "SET NULL",
      // },
      base_price_ex_showroom: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gst: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      insurance: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rto_registration_charges: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accessories_fitments: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_ex_showroom_price: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      //   subsidy: {
      //     type: DataTypes.STRING,
      //     allowNull: true,
      //   },
      on_road_price: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["dealer_id"] },
        { fields: ["customer_name"] },
        { fields: ["mobile_no"] },
        { fields: ["date"] },
        { fields: ["invoice_no"] },
        { fields: ["model"] },
        { fields: ["variant"] },
        { fields: ["color"] },
      ],
    }
  );

  await InvoiceModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const dealerCode = req.body?.dealer_code ?? "";
  const latest = await InvoiceModel.findOne({
    attributes: ["invoice_no"],
    where: { dealer_id: req.body.dealer_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newInvoiceNo = `${dealerCode}-INV-0001`;
  if (latest?.invoice_no) {
    const parts = latest.invoice_no.split("-");
    const lastNumber = parseInt(parts[parts.length - 1], 10); // take the last block
    const nextNumber = lastNumber + 1;
    newInvoiceNo = `${dealerCode}-INV-${String(nextNumber).padStart(4, "0")}`;
  }

  const data = await InvoiceModel.create(
    {
      enquiry_id: req.body.enquiry_id,
      customer_name: req.body.customer_name,
      mobile_no: req.body.mobile_no,
      date: req.body.date,
      invoice_no: newInvoiceNo,
      model: req.body.model,
      variant: req.body.variant,
      color: req.body.color,
      dealer_id: req.body.dealer_id,
      base_price_ex_showroom: req.body.base_price_ex_showroom,
      gst: req.body.gst,
      insurance: req.body.insurance,
      rto_registration_charges: req.body.rto_registration_charges,
      accessories_fitments: req.body.accessories_fitments,
      total_ex_showroom_price: req.body.total_ex_showroom_price,
      discount: req.body.discount,
      on_road_price: req.body.on_road_price,

      vehicle_ids: req.body.vehicle_ids,
      vehicle_variant_map_id: req.body.vehicle_variant_map_id,
      vehicle_color_id: req.body.vehicle_color_id,
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
      customer_name: req.body.customer_name,
      mobile_no: req.body.mobile_no,
      date: req.body.date,
      invoice_no: req.body.invoice_no,
      model: req.body.model,
      variant: req.body.variant,
      color: req.body.color,
      customer_id: req.body.customer_id,
      dealer_id: req.body.dealer_id,
      base_price_ex_showroom: req.body.base_price_ex_showroom,
      gst: req.body.gst,
      insurance: req.body.insurance,
      rto_registration_charges: req.body.rto_registration_charges,
      accessories_fitments: req.body.accessories_fitments,
      total_ex_showroom_price: req.body.total_ex_showroom_price,
      discount: req.body.discount,
      on_road_price: req.body.on_road_price,

      vehicle_ids: req.body.vehicle_ids,
      vehicle_variant_map_id: req.body.vehicle_variant_map_id,
      vehicle_color_id: req.body.vehicle_color_id,
    },
    options
  );
};

const getById = async (id) => {
  return await InvoiceModel.findOne({
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
        inv.customer_name ILIKE :query OR 
        inv.mobile_no ILIKE :query OR 
        inv.invoice_no ILIKE :query OR 
        inv.model ILIKE :query OR 
        inv.variant ILIKE :query OR 
        inv.color ILIKE :query
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
      inv.*,
      COALESCE(JSON_AGG(vh.title) FILTER (WHERE vh.title IS NOT NULL), '[]') AS vehicles
    FROM ${constants.models.INVOICE_TABLE} inv
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ANY(inv.vehicle_ids::uuid[])
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = inv.dealer_id
    ${whereClause}
    GROUP BY inv.id
    ORDER BY inv.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(inv.id) OVER()::integer as total
    FROM ${constants.models.INVOICE_TABLE} inv
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = ANY(inv.vehicle_ids::uuid[])
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = inv.dealer_id
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
