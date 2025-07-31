"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;

let FollowupModel = null;

const init = async (sequelize) => {
  FollowupModel = sequelize.define(
    constants.models.FOLLOW_UP_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      enquiry_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.ENQUIRY_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      dealer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.DEALER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["dealer_id"] },
        { fields: ["enquiry_id"] },
        { fields: ["message"] },
      ],
    }
  );

  await FollowupModel.sync({ alter: true });
};

const create = async (req) => {
  return await FollowupModel.create({
    dealer_id: req.body.dealer_id,
    enquiry_id: req.body.enquiry_id,
    message: req.body.message,
  });
};

const get = async (req) => {
  let whereConditions = [];
  const queryParams = {};
  const { role, id } = req.user_data;
  if (role === "dealer") {
    whereConditions.push(`dlr.user_id = :userId`);
    queryParams.userId = id;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(flw.message ILIKE :query OR dlr.location ILIKE :query OR usr.first_name ILIKE :query OR usr.last_name ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  const enquiry = req.query.enquiry ? req.query.enquiry : null;
  if (enquiry) {
    whereConditions.push(`flw.enquiry_id = :enquiryId`);
    queryParams.enquiryId = enquiry;
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
        COUNT(flw.id) OVER()::integer as total
      FROM ${constants.models.FOLLOW_UP_TABLE} flw
      LEFT JOIN ${constants.models.ENQUIRY_TABLE} enq ON enq.id = flw.enquiry_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ${whereClause}
      `;

  let query = `
      SELECT
        flw.*,
        CASE 
          WHEN dlr.id IS NULL THEN 'Not assigned'
          ELSE CONCAT(usr.first_name, ' ', usr.last_name, ' (', dlr.location, ')')
        END AS dealership
      FROM ${constants.models.FOLLOW_UP_TABLE} flw
      LEFT JOIN ${constants.models.ENQUIRY_TABLE} enq ON enq.id = flw.enquiry_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ${whereClause}
      ORDER BY flw.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await FollowupModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await FollowupModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { followups: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await FollowupModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await FollowupModel.update({ message: req.body.message }, options);
};

const deleteById = async (req, id) => {
  return await FollowupModel.destroy({
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
