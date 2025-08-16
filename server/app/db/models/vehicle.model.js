"use strict";
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
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.VEHICLE_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      category: {
        type: DataTypes.ENUM([
          "passenger",
          "cargo",
          "loader",
          "garbage",
          "e-cycle",
          "e-scooter",
          "golf",
        ]),
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
      video_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_variant: {
        type: DataTypes.BOOLEAN,
        defaulValue: false,
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      dealer_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      features: {
        // [{ heading: "", image: 0 }]
        type: DataTypes.JSONB,
        allowNull: false,
      },
      specifications: {
        // [{ tab_name: "", specs: [{ label:"", value:"" }] }]
        type: DataTypes.JSONB,
        allowNull: false,
      },
      pricing: {
        // [{ id: "", name: "", base_price: 0, cities: [{ id: "", name: "", price_modifier: 0 }] }]
        type: DataTypes.JSONB,
        allowNull: false,
      },
      emi_calculator: {
        // { defaultValues: {down_payment: 20000,loan_tenure: 24,interest_rate: 11.0} ranges: {down_payment: {min: 10000,step: 1000} loan_tenure: {min: 12,max: 48,step: 12} interest_rate: {min: 7.0,max: 14.0,step: 0.5}} financing_companies: [{id: "company-1",name: "Urban Finance Co.", interest_rate: 10.0,color: "#3B82F6"}]}
        type: DataTypes.JSONB,
        allowNull: false,
      },
      carousel: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      gallery: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      marketing_material: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      brochure: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      video_link: {
        type: DataTypes.TEXT,
      },
      meta_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.TEXT,
        allowNull: true,
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
        {
          fields: ["base_price"],
        },
        {
          fields: ["dealer_price"],
        },
        {
          fields: ["meta_title"],
        },
        {
          fields: ["meta_description"],
        },
        {
          fields: ["meta_keywords"],
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
      base_price: req.body.base_price,
      vehicle_id: req.body.vehicle_id,
      category: req.body.category,
      video_link: req.body.video_link,
      title: req.body.title,
      chassis_no: req.body.chassis_no,
      description: req.body.description,
      features: req.body.features,
      specifications: req.body.specifications,
      slug: req.body.slug,
      is_variant: req.body.is_variant,
      pricing: req.body.pricing,
      emi_calculator: req.body.emi_calculator,
      carousel: req.body.carousel,
      gallery: req.body.gallery,
      marketing_material: req.body.marketing_material,
      brochure: req.body.brochure,
      video_link: req.body.video_link,
      dealer_price: req.body.dealer_price,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;

  return await VehicleModel.update(
    {
      vehicle_id: req.body.vehicle_id,
      category: req.body.category,
      title: req.body.title,
      chassis_no: req.body.chassis_no,
      description: req.body.description,
      video_link: req.body.video_link,
      features: req.body.features,
      specifications: req.body.specifications,
      slug: req.body.slug,
      pricing: req.body.pricing,
      emi_calculator: req.body.emi_calculator,
      carousel: req.body.carousel,
      gallery: req.body.gallery,
      marketing_material: req.body.marketing_material,
      brochure: req.body.brochure,
      video_link: req.body.video_link,
      dealer_price: req.body.dealer_price,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
    },
    options
  );
};

const getById = async (req, id) => {
  return await VehicleModel.findOne({
    where: { id: req?.params?.id || id },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const getBySlug = async (req, slug) => {
  let query = `
  SELECT
      vh.*
    FROM ${constants.models.VEHICLE_TABLE} vh
    LEFT JOIN ${constants.models.VEHICLE_TABLE} vhvr ON vhvr.vehicle_id = vh.id
    WHERE vh.slug = :slug
    GROUP BY vh.id
  `;

  return await VehicleModel.sequelize.query(query, {
    replacements: { slug: req?.params?.slug || slug },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });
};

const get = async (req) => {
  const whereConditions = ["vh.vehicle_id IS null"];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  const type = req?.query?.type ?? null;
  const category = req.query.category ? req.query.category.split(".") : null;

  if (q) {
    whereConditions.push(
      `(vh.title ILIKE :query OR invnt.chassis_no ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  if (type === "main") {
    whereConditions.push(`(vh.is_variant IS false)`);
  } else if (type === "variant") {
    whereConditions.push(`(vh.is_variant IS true)`);
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
      vh.id, vh.title, vh.description, vh.category, vh.slug, vh.carousel, vh.marketing_material, vh.brochure, vh.dealer_price,
      (vh.pricing->0->>'base_price')::numeric AS starting_from,
      COALESCE(JSON_AGG(
        DISTINCT JSON_BUILD_OBJECT(
          'id', vclr.id,
          'color', vclr.color_name,
          'color_hex', vclr.color_hex,
          'carousel', vclr.carousel,
          'gallery', vclr.gallery
        )::jsonb
      ) FILTER (WHERE vclr.id IS NOT NULL), '[]') as colors, vh.created_at,
      COUNT(DISTINCT CASE WHEN invnt.status = 'active' THEN invnt.id END) as active_quantity,
      COUNT(DISTINCT CASE WHEN invnt.status = 'inactive' THEN invnt.id END) as inactive_quantity,
      COUNT(DISTINCT CASE WHEN invnt.status = 'sold' THEN invnt.id END) as sold_quantity,
      COUNT(DISTINCT CASE WHEN invnt.status = 'scrapped' THEN invnt.id END) as scrapped_quantity
    FROM ${constants.models.VEHICLE_TABLE} vh
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.vehicle_id = vh.id
    LEFT JOIN ${constants.models.VEHICLE_COLOR_TABLE} vclr ON vclr.vehicle_id = vh.id
    ${whereClause}
    GROUP BY vh.id
    ORDER BY vh.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT COUNT(DISTINCT vh.id)::integer as total
    FROM ${constants.models.VEHICLE_TABLE} vh
    LEFT JOIN ${constants.models.INVENTORY_TABLE} invnt ON invnt.status = 'active' AND invnt.vehicle_id = vh.id
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

  return {
    vehicles,
    total: count?.total ?? 0,
  };
};

const deleteByMobileNumber = async (mobile_number) => {
  return await VehicleModel.destroy({
    where: { mobile_number: mobile_number },
  });
};

const deleteById = async (req, id, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;
  return await VehicleModel.destroy({
    where: { id: req.params?.id || id },
    options,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  getBySlug: getBySlug,
  deleteByMobileNumber: deleteByMobileNumber,
  deleteById: deleteById,
};
