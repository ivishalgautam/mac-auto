"use strict";
import { toPgArray } from "../../helpers/to-pg-array.js";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let DealerModel = null;

const init = async (sequelize) => {
  DealerModel = sequelize.define(
    constants.models.DEALER_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      dealer_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadhaar: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      pan: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      gst: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["location"],
        },
      ],
    }
  );

  return DealerModel;

  await DealerModel.sync({ alter: true });
};

const create = async (
  { user_id, state, city, location, dealer_code, aadhaar, gst, pan },
  transaction
) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  // const latest = await DealerModel.findOne({
  //   attributes: ["dealer_code"],
  //   order: [["created_at", "DESC"]],
  //   raw: true,
  // });
  // let newCode = "DLR-0001";
  // if (latest?.dealer_code) {
  //   const number = parseInt(latest.dealer_code.split("-")[1]);
  //   const nextNumber = number + 1;
  //   newCode = `DLR-${String(nextNumber).padStart(4, "0")}`;
  // }

  const data = await DealerModel.create(
    {
      user_id: user_id,
      location: location,
      dealer_code: dealer_code,
      aadhaar: aadhaar,
      pan: pan,
      gst: gst,
      state: state,
      city: city,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id) => {
  return await DealerModel.update(
    { location: req.body.location, state: req.body.state, city: req.body.city },
    {
      where: { id: id },
      returning: true,
      raw: true,
    }
  );
};

const updateByUser = async (req, id, transaction) => {
  return await DealerModel.update(
    {
      state: req.body.state,
      city: req.body.city,
      location: req.body.location,
      aadhaar: req.body.aadhaar,
      pan: req.body.pan,
      gst: req.body.gst,
    },
    {
      where: { user_id: id },
      returning: true,
      raw: true,
      transaction,
    }
  );
};

const updateLocation = async (location, id) => {
  return await DealerModel.update(
    { location: location },
    {
      where: { id: id },
      returning: true,
      raw: true,
    }
  );
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  const states = req.query.states ? req.query.states.split(".") : null;
  const cities = req.query.cities ? req.query.cities.split(".") : null;

  if (states && states.length) {
    whereConditions.push(`LOWER(dlr.state) = ANY(:states)`);
    queryParams.states = toPgArray(states.map((d) => d.toLowerCase()));
  }

  if (cities && cities.length) {
    whereConditions.push(`LOWER(dlr.city) = ANY(:cities)`);
    queryParams.cities = toPgArray(cities.map((d) => d.toLowerCase()));
  }

  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR usr.email ILIKE :query OR dlr.location ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
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
    dlr.id, dlr.location, dlr.dealer_code, dlr.created_at, dlr.state, dlr.city,
    usr.id as user_id, CONCAT(usr.first_name, ' ', usr.last_name) as fullname,
    usr.username, usr.mobile_number, usr.email, usr.is_active
  FROM ${constants.models.DEALER_TABLE} dlr
  LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
  ${whereClause}
  GROUP BY dlr.id, usr.id
  ORDER BY usr.created_at DESC
  LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
    COUNT(usr.id) OVER()::integer as total
  FROM ${constants.models.DEALER_TABLE} dlr
  LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
  ${whereClause}
  `;

  const dealers = await DealerModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await DealerModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { dealers, total: count?.total ?? 0 };
};
const getById = async (id) => {
  return await DealerModel.findOne({
    where: {
      id: id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const getByUserId = async (user_id) => {
  return await DealerModel.findOne({
    where: { user_id: user_id },
    order: [["created_at", "DESC"]],
    raw: true,
  });
};

const deleteByUserId = async (user_id) => {
  return await DealerModel.destroy({
    where: { user_id: user_id },
  });
};

const deleteById = async (id) => {
  return await DealerModel.destroy({
    where: { id: id },
  });
};

const getModel = () => {
  if (!DealerModel) {
    throw new Error("DealerModel has not been initialized. Call init() first.");
  }
  return DealerModel;
};

export default {
  init: init,
  create: create,
  update: update,
  updateByUser: updateByUser,
  getById: getById,
  getByUserId: getByUserId,
  deleteByUserId: deleteByUserId,
  deleteById: deleteById,
  updateLocation: updateLocation,
  get: get,
  getModel: getModel,
};
