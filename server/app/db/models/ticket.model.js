"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let TicketModel = null;

const init = async (sequelize) => {
  TicketModel = sequelize.define(
    constants.models.TICKET_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      ticket_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      images: {
        type: DataTypes.JSONB,
        defaultValue: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(["pending", "in process", "resolved"]),
        allowNull: false,
        defaultValue: "pending",
      },
      purchase_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.CUSTOMER_PURCHASE_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      complaint_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expected_closure_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      assigned_technician: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.TECHNICIAN_TABLE,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "SET NULL",
      },
      parts: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["images"] },
        { fields: ["ticket_number"] },
        { fields: ["message"] },
        { fields: ["status"] },
        { fields: ["purchase_id"] },
        { fields: ["complaint_type"] },
        { fields: ["expected_closure_date"] },
        { fields: ["assigned_technician"] },
        { fields: ["parts"] },
      ],
    }
  );

  await TicketModel.sync({ alter: true });
};

const create = async (req) => {
  const latest = await TicketModel.findOne({
    attributes: ["ticket_number"],
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newTicketNo = "TICKET-0001";
  if (latest?.ticket_number) {
    const number = parseInt(latest.ticket_number.split("-")[1]);
    const nextNumber = number + 1;
    newTicketNo = `TICKET-${String(nextNumber).padStart(4, "0")}`;
  }

  return await TicketModel.create({
    images: req.body?.images ?? [],
    ticket_number: newTicketNo,
    message: req.body.message,
    purchase_id: req.body.purchase_id,
    complaint_type: req.body.complaint_type,
    expected_closure_date: req.body.expected_closure_date,
    assigned_technician:
      req.body?.assigned_technician && req.body?.assigned_technician !== ""
        ? req.body?.assigned_technician
        : null,
    parts: req.body.parts,
  });
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await TicketModel.update(
    {
      images: req.body?.images ?? [],
      message: req.body.message,
      status: req.body.status,
      complaint_type: req.body.complaint_type,
      expected_closure_date: req.body.expected_closure_date,
      assigned_technician: req.body.assigned_technician,
      parts: req.body.parts,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};

  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push(`dl.user_id = :userId`);
    queryParams.userId = id;
  }
  if (role === "customer") {
    whereConditions.push(`cst.user_id = :userId`);
    queryParams.userId = id;
  }

  const status = req.query.status ? req.query.status.split(".") : null;
  if (status?.length) {
    whereConditions.push(`tk.status = any(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  let q = req.query.q;
  if (q) {
    whereConditions.push(`(tk.ticket_number ILIKE :query)`);
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
        COUNT(tk.id) OVER()::integer as total
      FROM ${constants.models.TICKET_TABLE} tk
      LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.id = tk.purchase_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = cpt.dealer_id
      LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cpt.customer_id
      LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = cst.user_id
      ${whereClause}
    `;

  let query = `
    SELECT
        tk.*, cpt.chassis_no,
        CONCAT(dstu.first_name, ' ', COALESCE(dstu.last_name, ''), ' (', dl.location, ')') as dealership_name,
        dstu.mobile_number as dealership_phone,
        CONCAT(cstu.first_name, ' ', COALESCE(cstu.last_name, '')) as customer_name,
        cstu.mobile_number as customer_phone,
        tcn.technician_name as assigned_technician
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.id = tk.purchase_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = cpt.dealer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cpt.customer_id
    LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = cst.user_id
    LEFT JOIN ${constants.models.USER_TABLE} dstu ON dstu.id = dl.user_id
    LEFT JOIN ${constants.models.TECHNICIAN_TABLE} tcn ON tk.assigned_technician = tcn.id
    ${whereClause}
    ORDER BY tk.created_at DESC
    LIMIT :limit OFFSET :offset
    `;

  const tickets = await TicketModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await TicketModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { tickets: tickets, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  const query = `
  SELECT
      tk.*,
      cp.customer_id
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cp ON cp.id = tk.purchase_id
    WHERE tk.id = :id
  `;

  return await TicketModel.sequelize.query(query, {
    replacements: {
      id: req.params.id || id,
    },
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getTicketDetailsById = async (req, id) => {
  const query = `
  SELECT
      tk.*, cp.chassis_no,
      dstu.first_name as dealership_first_name, dstu.last_name as dealership_last_name, dstu.mobile_number as dealership_phone,
      dl.location as dealership_location,
      cstu.first_name as customer_first_name, cstu.last_name as customer_last_name, cstu.mobile_number as customer_phone,
      tcn.technician_name as assigned_technician_name, tcn.technician_phone as assigned_technician_phone
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cp ON cp.id = tk.purchase_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = cp.dealer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cp.customer_id
    LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = cst.user_id
    LEFT JOIN ${constants.models.USER_TABLE} dstu ON dstu.id = dl.user_id
    LEFT JOIN ${constants.models.TECHNICIAN_TABLE} tcn ON tk.assigned_technician = tcn.id
    WHERE tk.id = :id
  `;

  return await TicketModel.sequelize.query(query, {
    replacements: {
      id: req.params.id || id,
    },
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params.id || id } };
  if (transaction) options.transaction = transaction;

  return await TicketModel.destroy(options);
};

const getTicketStatusBreakdown = async () => {
  const result = await TicketModel.findAll({
    attributes: [
      "status",
      [sequelizeFwk.fn("COUNT", sequelizeFwk.col("status")), "count"],
    ],
    group: ["status"],
    raw: true,
  });

  return result.map((r) => ({
    status: r.status,
    value: parseInt(r.count),
  }));
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
  getTicketStatusBreakdown: getTicketStatusBreakdown,
  getTicketDetailsById: getTicketDetailsById,
};
