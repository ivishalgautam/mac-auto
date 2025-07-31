"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let SchemeModel = null;

const init = async (sequelize) => {
  SchemeModel = sequelize.define(
    constants.models.SCHEME_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      file: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await SchemeModel.sync({ alter: true });
};

const create = async (req) => {
  return await SchemeModel.create({
    file: req.body.file,
    message: req.body.message,
    is_active: req.body.is_active,
    date: req.body.date,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await SchemeModel.update(
    {
      file: req.body.file,
      message: req.body.message,
      is_active: req.body.is_active,
      date: req.body.date,
    },
    options
  );
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};

  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push(`scm.is_active IS true`);
  }

  let q = req.query.q;
  if (q) {
    whereConditions.push(`(scm.message ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const startDate = req.query?.start_date || null;
  const endDate = req.query?.end_date || null;
  if (startDate && endDate) {
    whereConditions.push(`scm.date BETWEEN :startDate AND :endDate`);
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  } else if (startDate) {
    whereConditions.push(`scm.date >= :startDate`);
    queryParams.startDate = startDate;
  } else if (endDate) {
    whereConditions.push(`scm.date <= :endDate`);
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
        COUNT(scm.id) OVER()::integer as total
      FROM ${constants.models.SCHEME_TABLE} scm
      ${whereClause}
      `;

  let query = `
      SELECT
        scm.*
      FROM ${constants.models.SCHEME_TABLE} scm
      ${whereClause}
      ORDER BY scm.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await SchemeModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await SchemeModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { schemes: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await SchemeModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await SchemeModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
