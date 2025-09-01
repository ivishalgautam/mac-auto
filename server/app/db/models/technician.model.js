"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let TechnicianModel = null;

const init = async (sequelize) => {
  TechnicianModel = sequelize.define(
    constants.models.TECHNICIAN_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      technician_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      technician_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["technician_name"] },
        { fields: ["technician_phone"] },
      ],
    }
  );

  await TechnicianModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await TechnicianModel.create(
    {
      technician_name: req.body.technician_name,
      technician_phone: req.body.technician_phone,
    },
    options
  );

  return data.dataValues;
};

const bulkCreate = async (bulkdData) => {
  return await TechnicianModel.bulkCreate(bulkdData);
};

const update = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  const data = await TechnicianModel.update(
    {
      technician_name: req.body.technician_name,
      technician_phone: req.body.technician_phone,
    },
    options
  );

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const q = req.query?.q ?? null;
  if (q) {
    whereConditions.push(
      "vmd.technician_name ILIKE :q OR vmd.technician_phone ILIKE :q"
    );
    queryParams.q = `%${q}%`;
  }

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
      vmd.*
    FROM ${constants.models.TECHNICIAN_TABLE} vmd
    ${whereClause}
    GROUP BY vmd.id
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(vmd.id) OVER()::integer as total
    FROM ${constants.models.TECHNICIAN_TABLE} vmd
  ${whereClause}
  `;

  const technicians = await TechnicianModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await TechnicianModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { technicians, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await TechnicianModel.findOne({
    where: { id: req.params?.id || id },
  });
};
const deleteById = async (req, id) => {
  return await TechnicianModel.destroy({
    where: { id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
