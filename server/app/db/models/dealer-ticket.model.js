"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let DealerTicketModel = null;

const init = async (sequelize) => {
  DealerTicketModel = sequelize.define(
    constants.models.DEALER_TICKET_TABLE,
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
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(["pending", "in process", "resolved"]),
        allowNull: false,
        defaultValue: "pending",
      },
      complaint_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expected_closure_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["ticket_number"] },
        { fields: ["message"] },
        { fields: ["status"] },
        { fields: ["complaint_type"] },
        { fields: ["expected_closure_date"] },
        { fields: ["dealer_id"] },
      ],
    }
  );

  await DealerTicketModel.sync({ alter: true });
};

const create = async (req) => {
  const latest = await DealerTicketModel.findOne({
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

  return await DealerTicketModel.create({
    ticket_number: newTicketNo,
    message: req.body.message,
    complaint_type: req.body.complaint_type,
    expected_closure_date: req.body.expected_closure_date,
    dealer_id: req.body.dealer_id,
  });
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await DealerTicketModel.update(
    {
      status: req.body.status,
      message: req.body.message,
      complaint_type: req.body.complaint_type,
      expected_closure_date: req.body.expected_closure_date,
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
      FROM ${constants.models.DEALER_TICKET_TABLE} tk
      LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = tk.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dl.user_id
      ${whereClause}
    `;

  let query = `
    SELECT
        tk.*,
        CONCAT(usr.first_name, ' ', COALESCE(usr.last_name, ''), ' (', dl.location, ')') as dealership_name,
        usr.mobile_number as dealership_phone
    FROM ${constants.models.DEALER_TICKET_TABLE} tk
    LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = tk.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dl.user_id
    ${whereClause}
    ORDER BY tk.created_at DESC
    LIMIT :limit OFFSET :offset
    `;

  const tickets = await DealerTicketModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerTicketModel.sequelize.query(countQuery, {
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
      tk.*
    FROM ${constants.models.DEALER_TICKET_TABLE} tk
    WHERE tk.id = :id
  `;

  return await DealerTicketModel.sequelize.query(query, {
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
      tk.*,
      usr.first_name as dealership_first_name, usr.last_name as dealership_last_name, usr.mobile_number as dealership_phone,
      dl.location as dealership_location
    FROM ${constants.models.DEALER_TICKET_TABLE} tk
    LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = tk.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dl.user_id
    WHERE tk.id = :id
  `;

  return await DealerTicketModel.sequelize.query(query, {
    replacements: { id: req.params.id || id },
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await DealerTicketModel.destroy({
    where: { id: req.params.id || id },
  });
};

const getTicketStatusBreakdown = async () => {
  const result = await DealerTicketModel.findAll({
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
