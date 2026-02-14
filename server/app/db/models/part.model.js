"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let PartModel = null;

const init = async (sequelize) => {
  PartModel = sequelize.define(
    constants.models.PART_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      part_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return PartModel;
  await PartModel.sync({ alter: true });
};

const create = async (req) => {
  return await PartModel.create({
    part_name: req.body.part_name,
  });
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};
  let q = req.query.q;
  if (q) {
    whereConditions.push(`(pt.name ILIKE :query)`);
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
        COUNT(pt.id) OVER()::integer as total
      FROM ${constants.models.PART_TABLE} pt
      ${whereClause}
      `;

  let query = `
      SELECT
        pt.*
      FROM ${constants.models.PART_TABLE} pt
      ${whereClause}
      ORDER BY pt.created_at DESC
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

  return { parts: data, total: count?.[0]?.total ?? 0 };
};

const getById = async (req, id) => {
  return await PartModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const update = async (req, id) => {
  const [, rows] = await PartModel.update(
    { part_name: req.body.part_name },
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
};
