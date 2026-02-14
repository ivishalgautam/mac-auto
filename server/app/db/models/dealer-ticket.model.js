"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
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
      assigned_cre: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.USER_TABLE,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
          key: "id",
        },
        onDelete: "SET NULL",
      },
      assigned_manager: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.USER_TABLE,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
          key: "id",
        },
        onDelete: "SET NULL",
      },
      job_card: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      images: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      videos: {
        type: DataTypes.JSONB,
        defaultValue: [],
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

  return DealerTicketModel;
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
    assigned_cre: req.body.assigned_cre,
    assigned_manager: req.body.assigned_manager,
    job_card: req.body.job_card,
    images: req.body.images,
    videos: req.body.videos,
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
      assigned_cre: req.body.assigned_cre,
      assigned_manager: req.body.assigned_manager,
      job_card: req.body.job_card,
      images: req.body.images,
      videos: req.body.videos,
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
  if (role === "cre") {
    whereConditions.push(`creusr.id = :userId`);
    queryParams.userId = id;
  }
  if (role === "manager") {
    whereConditions.push(`mgusr.id = :userId`);
    queryParams.userId = id;
  }

  const status = req.query.status ? req.query.status.split(".") : null;
  if (status?.length) {
    whereConditions.push(`tk.status = any(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  let q = req.query.q?.trim();

  if (q) {
    whereConditions.push(`(
      tk.ticket_number ILIKE :query OR

      usr.first_name ILIKE :query OR
      usr.last_name ILIKE :query OR
      (usr.first_name || ' ' || usr.last_name) ILIKE :query
    )`);
    queryParams.query = `%${q}%`;
  }

  const startDate = req.query.start_date || null;
  const endDate = req.query.end_date || null;
  if (startDate && endDate) {
    whereConditions.push(
      `(tk.created_at::date >= :startDate AND tk.created_at::date <= :endDate)`
    );
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  } else if (startDate) {
    whereConditions.push(`tk.created_at::date >= :startDate`);
    queryParams.startDate = startDate;
  } else if (endDate) {
    whereConditions.push(`tk.created_at::date <= :endDate`);
    queryParams.endDate = endDate;
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
      LEFT JOIN ${constants.models.USER_TABLE} creusr ON creusr.id = tk.assigned_cre
      LEFT JOIN ${constants.models.USER_TABLE} mgusr ON mgusr.id = tk.assigned_manager
      ${whereClause}
    `;

  let query = `
    SELECT
        tk.*,
        CONCAT(usr.first_name, ' ', COALESCE(usr.last_name, ''), ' (', dl.location, ')') as dealership_name,
        usr.mobile_number as dealership_phone,
        dl.state, dl.city
      FROM ${constants.models.DEALER_TICKET_TABLE} tk
      LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = tk.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dl.user_id
      LEFT JOIN ${constants.models.USER_TABLE} creusr ON creusr.id = tk.assigned_cre
      LEFT JOIN ${constants.models.USER_TABLE} mgusr ON mgusr.id = tk.assigned_manager
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

const getLastCREAssignedTicket = async () => {
  return await DealerTicketModel.findOne({
    where: {
      assigned_cre: { [Op.ne]: null },
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    type: QueryTypes.SELECT,
    raw: true,
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

const count = async (req, last_30_days = false) => {
  const { id } = req.user_data;
  const whereConditions = ["dlr.user_id = :userId"];
  const queryParams = { userId: id };

  if (last_30_days) {
    whereConditions.push("tk.created_at >= :createdAfter");
    queryParams.createdAfter = moment()
      .subtract(30, "days")
      .format("YYYY-MM-DD HH:mm:ss");
  }

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  let query = `
  SELECT
      COUNT(tk.id)
    FROM ${constants.models.DEALER_TICKET_TABLE} tk
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = tk.dealer_id
    ${whereClause} 
  `;

  const { count } = await DealerTicketModel.sequelize.query(query, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return count;
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  getLastCREAssignedTicket: getLastCREAssignedTicket,
  deleteById: deleteById,
  getTicketStatusBreakdown: getTicketStatusBreakdown,
  getTicketDetailsById: getTicketDetailsById,
  count: count,
};
