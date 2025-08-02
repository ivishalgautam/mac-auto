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
      images: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["images"] },
        { fields: ["message"] },
        { fields: ["status"] },
        { fields: ["purchase_id"] },
      ],
    }
  );

  await TicketModel.sync({ alter: true });
};

const create = async (req) => {
  return await TicketModel.create({
    images: req.body.images,
    message: req.body.message,
    purchase_id: req.body.purchase_id,
  });
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req?.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await TicketModel.update(
    {
      images: req.body.images,
      message: req.body.message,
      status: req.body.status,
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

  let q = req.query.q;
  if (q) {
    whereConditions.push(
      `(fin.name ILIKE :query OR fin.area_serve ILIKE :query)`
    );
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
      ${whereClause}
    `;

  let query = `
    SELECT
        tk.*
    FROM ${constants.models.TICKET_TABLE} tk
    LEFT JOIN ${constants.models.CUSTOMER_PURCHASE_TABLE} cpt ON cpt.id = tk.purchase_id
    LEFT JOIN ${constants.models.DEALER_TABLE} dl ON dl.id = cpt.dealer_id
    LEFT JOIN ${constants.models.CUSTOMER_TABLE} cst ON cst.id = cpt.customer_id
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
  return await TicketModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id) => {
  return await TicketModel.destroy({
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
