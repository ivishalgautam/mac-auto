"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
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
        defaultValue: [],
      },
      videos: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mac_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(["pending", "in process", "resolved"]),
        allowNull: false,
        defaultValue: "pending",
      },
      warranty_detail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // purchase_id: {
      //   type: DataTypes.UUID,
      //   allowNull: false,
      //   references: {
      //     model: constants.models.CUSTOMER_PURCHASE_TABLE,
      //     key: "id",
      //     deferrable: Deferrable.INITIALLY_IMMEDIATE,
      //   },
      //   onDelete: "CASCADE",
      // },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      punch_by_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      punch_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      complaint_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expected_closure_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
      assigned_technician: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.TECHNICIAN_TABLE,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
          key: "id",
        },
        onDelete: "SET NULL",
      },
      parts: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      part_ids: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["ticket_number"] },
        { fields: ["customer_id"] },
        { fields: ["punch_by_id"] },
        { fields: ["assigned_technician"] },
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
    videos: req.body?.videos ?? [],
    ticket_number: newTicketNo,
    message: req.body.message,
    mac_message: req.body.mac_message,
    // purchase_id: req.body.purchase_id,
    complaint_type: req.body.complaint_type,
    expected_closure_date: req.body.expected_closure_date,
    assigned_technician:
      req.body?.assigned_technician && req.body?.assigned_technician !== ""
        ? req.body?.assigned_technician
        : null,
    assigned_cre: req.body.assigned_cre,
    assigned_manager: req.body?.assigned_manager ?? null,

    customer_id: req.body.customer_id,
    punch_by_id: req.user_data.id,
    punch_by: req.user_data.role,

    warranty_detail: req.body.warranty_detail,

    part_ids: req.body.part_ids,
  });
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await TicketModel.update(
    {
      images: req.body?.images ?? [],
      videos: req.body?.videos ?? [],
      message: req.body.message,
      mac_message: req.body.mac_message,
      status: req.body.status,
      complaint_type: req.body.complaint_type,
      expected_closure_date: req.body.expected_closure_date,
      assigned_technician: req.body.assigned_technician,
      assigned_cre: req.body.assigned_cre,
      assigned_manager: req.body.assigned_manager,
      parts: req.body.parts,
      warranty_detail: req.body.warranty_detail,
      part_ids: req.body.part_ids,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};

  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push(`(tk.punch_by_id = :userId OR dlr.user_id = :userId)`);
    queryParams.userId = id;
  }
  if (role === "customer") {
    whereConditions.push(`tk.customer_id = :userId`);
    queryParams.userId = id;
  }
  if (role === "cre") {
    whereConditions.push(`tk.assigned_cre = :userId`);
    queryParams.userId = id;
  }
  if (role === "manager") {
    whereConditions.push(`tk.assigned_manager = :userId`);
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

    pnusr.first_name ILIKE :query OR
    pnusr.last_name ILIKE :query OR
    (pnusr.first_name || ' ' || pnusr.last_name) ILIKE :query OR

    cstu.first_name ILIKE :query OR
    cstu.last_name ILIKE :query OR
    (cstu.first_name || ' ' || cstu.last_name) ILIKE :query
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

  let query = `
    SELECT
        tk.*,
        CONCAT(pnusr.first_name, ' ', COALESCE(pnusr.last_name, '')) as punch_by_username,
        CONCAT(cstu.first_name, ' ', COALESCE(cstu.last_name, '')) as customer_name,
        cstu.mobile_number as customer_phone,
        tcn.technician_name as assigned_technician,
        cst.state, cst.city,
        parts_data.parts
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = tk.customer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.user_id = cstu.id
    LEFT JOIN ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlr ON cstdlr.customer_id = cst.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlr.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} pnusr ON pnusr.id = tk.punch_by_id
    LEFT JOIN ${constants.models.TECHNICIAN_TABLE} tcn ON tk.assigned_technician = tcn.id
    LEFT JOIN ${constants.models.USER_TABLE} creusr ON creusr.id = tk.assigned_cre
    LEFT JOIN ${constants.models.USER_TABLE} mgusr ON mgusr.id = tk.assigned_manager
    LEFT JOIN LATERAL (
      SELECT json_agg(prt) AS parts
      FROM ${constants.models.PART_TABLE} prt
      WHERE prt.id IN (
        SELECT jsonb_array_elements_text(tk.part_ids)::uuid
      )
    ) parts_data ON TRUE
    ${whereClause}
    ORDER BY tk.created_at DESC
    LIMIT :limit OFFSET :offset
    `;

  let countQuery = `
    SELECT
        COUNT(tk.id) OVER()::integer as total
      FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = tk.customer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.user_id = cstu.id
    LEFT JOIN ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlr ON cstdlr.customer_id = cst.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlr.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} pnusr ON pnusr.id = tk.punch_by_id
    LEFT JOIN ${constants.models.TECHNICIAN_TABLE} tcn ON tk.assigned_technician = tcn.id
    LEFT JOIN ${constants.models.USER_TABLE} creusr ON creusr.id = tk.assigned_cre
    LEFT JOIN ${constants.models.USER_TABLE} mgusr ON mgusr.id = tk.assigned_manager
    LEFT JOIN LATERAL (
      SELECT json_agg(prt) AS parts
      FROM ${constants.models.PART_TABLE} prt
      WHERE prt.id IN (
        SELECT jsonb_array_elements_text(tk.part_ids)::uuid
      )
    ) parts_data ON TRUE
      ${whereClause}
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
      tk.*
    FROM ${constants.models.TICKET_TABLE} tk
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

const getLastCREAssignedTicket = async () => {
  return await TicketModel.findOne({
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
      pnchusr.first_name as punch_user_first_name, pnchusr.last_name as punch_user_last_name, pnchusr.mobile_number as punch_user_phone,
      cstu.first_name as customer_first_name, cstu.last_name as customer_last_name, cstu.mobile_number as customer_phone,
      tcn.technician_name as assigned_technician_name, tcn.technician_phone as assigned_technician_phone,
      cst.state, cst.city, cst.address,
      dlrusr.first_name as dealership_first_name,
      dlrusr.last_name as dealership_last_name,
      dlrusr.mobile_number as dealership_phone,
      dlr.location as dealership_location,
      dlr.state as dealership_state,
      dlr.city as dealership_city,
      parts_data.parts
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.USER_TABLE} cstu ON cstu.id = tk.customer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.user_id = cstu.id
    LEFT JOIN ${constants.models.CUSTOMER_DEALERS_TABLE} cstdlr ON cstdlr.customer_id = cst.id
    LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = cstdlr.dealer_id
    LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
    LEFT JOIN ${constants.models.USER_TABLE} pnchusr ON pnchusr.id = tk.punch_by_id
    LEFT JOIN ${constants.models.TECHNICIAN_TABLE} tcn ON tk.assigned_technician = tcn.id
    LEFT JOIN LATERAL (
      SELECT json_agg(prt) AS parts
      FROM ${constants.models.PART_TABLE} prt
      WHERE prt.id IN (
        SELECT jsonb_array_elements_text(tk.part_ids)::uuid
      )
    ) parts_data ON TRUE
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

const count = async (req, last_30_days = false) => {
  const { id } = req.user_data;
  const whereConditions = ["tk.punch_by_id = :userId"];
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
    FROM ${constants.models.TICKET_TABLE} tk
    ${whereClause} 
  `;

  const { count } = await TicketModel.sequelize.query(query, {
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
  deleteById: deleteById,
  getTicketStatusBreakdown: getTicketStatusBreakdown,
  getTicketDetailsById: getTicketDetailsById,
  getLastCREAssignedTicket: getLastCREAssignedTicket,
  count: count,
};
