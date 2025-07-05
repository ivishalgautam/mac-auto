"use strict";
import moment from "moment";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let VehicleModel = null;

const init = async (sequelize) => {
  VehicleModel = sequelize.define(
    constants.models.VEHICLE_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      category: {
        type: DataTypes.ENUM(["passenger", "cargo", "garbage"]),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: {
          args: true,
          msg: "Vehicle exist with this name!",
        },
      },
      colors: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      pricing: {
        // [{ id: "", name: "", base_price: 0, cities: [{ id: "", name: "", price_modifier: 0 }] }]
        type: DataTypes.JSONB,
        allowNull: false,
      },
      emi_calculator: {
        // { defaultValues: {downPayment: 20000,loanTenure: 24,interestRate: 11.0} ranges: {downPayment: {min: 10000,step: 1000} loanTenure: {min: 12,max: 48,step: 12} interestRate: {min: 7.0,max: 14.0,step: 0.5}} financingCompanies: [{id: "company-1",name: "Urban Finance Co.", interestRate: 10.0,color: "#3B82F6"}]}
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["title"],
        },
        {
          fields: ["slug"],
          unique: true,
        },
      ],
    }
  );

  await VehicleModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await VehicleModel.create(
    {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      slug: req.body.slug,
      is_variant: req.body.is_variant,
      colors: req.body.colors,
      pricing: req.body.pricing,
      emi_calculator: req.body.emi_calculator,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id) => {
  return await VehicleModel.update(
    {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      slug: req.body.slug,
      is_variant: req.body.is_variant,
      colors: req.body.colors,
      pricing: req.body.pricing,
      emi_calculator: req.body.emi_calculator,
    },
    {
      where: { id: req.params?.id || id },
      returning: true,
      raw: true,
    }
  );
};

const getById = async (req, id) => {
  return await VehicleModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  const category = req.query.category ? req.query.category.split(".") : null;

  if (q) {
    whereConditions.push(`(vh.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  if (category?.length) {
    whereConditions.push(`vh.category = any(:category)`);
    queryParams.category = `{${category.join(",")}}`;
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
      vh.*
    FROM ${constants.models.VEHICLE_TABLE} vh
    ${whereClause}
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(vh.id) OVER()::integer as total
    FROM ${constants.models.VEHICLE_TABLE} vh
    ${whereClause}
  `;

  const vehicles = await VehicleModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await VehicleModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { vehicles, total: count?.total ?? 0 };
};

const deleteByMobileNumber = async (mobile_number) => {
  return await VehicleModel.destroy({
    where: { mobile_number: mobile_number },
  });
};

const deleteById = async (req, id) => {
  return await VehicleModel.destroy({
    where: { id: req.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteByMobileNumber: deleteByMobileNumber,
  deleteById: deleteById,
};
