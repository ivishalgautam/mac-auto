"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
const { DataTypes } = sequelizeFwk;
import { format, subDays, eachDayOfInterval } from "date-fns";

let EnquiryModel = null;

const init = async (sequelize) => {
  EnquiryModel = sequelize.define(
    constants.models.ENQUIRY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.VEHICLE_TABLE,
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
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          max: 2147483647,
          min: -2147483648,
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "in process",
          "converted",
          "dealer assigned",
        ]),
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["dealer_id"] },
        { fields: ["vehicle_id"] },
        { fields: ["quantity"] },
        { fields: ["message"] },
        { fields: ["name"] },
        { fields: ["email"] },
        { fields: ["phone"] },
        { fields: ["location"] },
        { fields: ["status"] },
      ],
    }
  );

  await EnquiryModel.sync({ alter: true });
};

const create = async (req) => {
  return await EnquiryModel.create({
    dealer_id: req.body.dealer_id,
    vehicle_id: req.body.vehicle_id,
    quantity: req.body.quantity,
    message: req.body.message,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    location: req.body.location,
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
      `(vh.title ILIKE :query OR dlr.location ILIKE :query OR usr.first_name ILIKE :query OR usr.last_name ILIKE :query))`
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
        COUNT(enq.id) OVER()::integer as total
      FROM ${constants.models.ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ${whereClause}
      `;

  let query = `
      SELECT
        enq.*, vh.title as vehicle_name,
        CASE 
          WHEN dlr.id IS NULL THEN 'Not assigned'
          ELSE CONCAT(usr.first_name, ' ', usr.last_name, ' (', dlr.location, ')')
        END AS dealership
      FROM ${constants.models.ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ${whereClause}
      ORDER BY enq.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await EnquiryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await EnquiryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { enquiries: data, total: count.total ?? 0 };
};

const getById = async (req, id) => {
  return await EnquiryModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await EnquiryModel.update(
    { status: req.body.status, dealer_id: req.body.dealer_id },
    options
  );
};

const deleteById = async (req, id) => {
  return await EnquiryModel.destroy({
    where: { id: req.params.id || id },
  });
};

const getEnquiriesOverTime = async (days = 7) => {
  // Query last `n` days of enquiry data grouped by date
  const result = await EnquiryModel.findAll({
    attributes: [
      [sequelizeFwk.fn("DATE", sequelizeFwk.col("created_at")), "date"],
      [sequelizeFwk.fn("COUNT", "*"), "count"],
    ],
    where: {
      created_at: {
        [Op.gte]: sequelizeFwk.literal(
          `CURRENT_DATE - INTERVAL '${days} days'`
        ),
      },
    },
    group: [sequelizeFwk.fn("DATE", sequelizeFwk.col("created_at"))],
    order: [[sequelizeFwk.fn("DATE", sequelizeFwk.col("created_at")), "ASC"]],
    raw: true,
  });

  // Map results to a dictionary for fast lookup
  const countByDate = Object.fromEntries(
    result.map((r) => [format(new Date(r.date), "yyyy-MM-dd"), Number(r.count)])
  );

  // Generate past `days` date range
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  });

  // Create full graph-ready array
  const labels = dateRange.map((d) => format(d, "yyyy-MM-dd"));
  const data = labels.map((date) => countByDate[date] ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "Enquiries",
        data,
      },
    ],
  };
};

const getLatestEnquiries = async (limit = 10) => {
  const query = `
      SELECT 
        eq.*,
        vh.title AS vehicle_title,
        CASE 
          WHEN dlr.id IS NULL THEN 'Not assigned'
          ELSE CONCAT(usr.first_name, ' ', usr.last_name, ' (', dlr.location, ')')
        END AS dealership
      FROM ${constants.models.ENQUIRY_TABLE} eq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = eq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = eq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ORDER BY eq.created_at DESC
      LIMIT :limit
    `;

  return await EnquiryModel.sequelize.query(query, {
    replacements: { limit },
    type: QueryTypes.SELECT,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
  getEnquiriesOverTime: getEnquiriesOverTime,
  getLatestEnquiries: getLatestEnquiries,
};
