"use strict";
import { toPgArray } from "../../helpers/to-pg-array.js";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let PartModel = null;

const init = async (sequelize) => {
  PartModel = sequelize.define(
    constants.models.TICKET_UPDATE_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ticket_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.TICKET_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      dealer_ticket_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.DEALER_TICKET_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["ticket_id"] }, { fields: ["dealer_ticket_id"] }],
    }
  );

  return PartModel;
  await PartModel.sync({ alter: true });
};

const create = async (req) => {
  return await PartModel.create({
    title: req.body.title,
    description: req.body.description,
    ticket_id: req.body.ticket_id,
    dealer_ticket_id: req.body.dealer_ticket_id,
  });
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};

  const tickets = req.params.tickets
    ? (req.params?.tickets?.split(".") ?? [])
    : null;

  if (tickets) {
    whereConditions.push(`tick.ticket_id = ANY(:tickets)`);
    queryParams.tickets = `${toPgArray(tickets)}`;
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
        COUNT(tick.id) OVER()::integer as total
      FROM ${constants.models.TICKET_UPDATE_TABLE} tick
      ${whereClause}
      `;

  let query = `
      SELECT
        tick.*
      FROM ${constants.models.TICKET_UPDATE_TABLE} tick
      ${whereClause}
      ORDER BY tick.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await PartModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await PartModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
  });

  return { updates: data, total: count?.[0]?.total ?? 0 };
};

const getById = async (req, id) => {
  return await PartModel.findOne({
    where: {
      id: req.params?.id || id,
    },
  });
};

const getByTicket = async (req, id) => {
  return await PartModel.findAll({
    where: {
      [Op.or]: {
        ticket_id: req.params?.id || id,
        dealer_ticket_id: req.params?.id || id,
      },
    },
    order: [["created_at", "DESC"]],
  });
};

const update = async (req, id) => {
  const [, rows] = await PartModel.update(
    { title: req.body.title, description: req.body.description },
    {
      where: { id: req.params.id || id },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const deleteById = async (req, id) => {
  return await PartModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  update: update,
  deleteById: deleteById,
  getByTicket: getByTicket,
};
