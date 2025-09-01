"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable, Op, QueryTypes } from "sequelize";
import { format, subDays, eachDayOfInterval } from "date-fns";
const { DataTypes } = sequelizeFwk;

let WalkInEnquiryModel = null;

const init = async (sequelize) => {
  WalkInEnquiryModel = sequelize.define(
    constants.models.WALKIN_ENQUIRY_TABLE,
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
      enquiry_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      enquiry_type: {
        type: DataTypes.ENUM(["mac-auto", "walk-in"]),
        defaultValue: "mac-auto",
      },
      status: {
        type: DataTypes.ENUM(["pending", "approved", "rejected", "converted"]),
        defaultValue: "pending",
      },
      purchase_type: {
        type: DataTypes.ENUM(["", "cash", "finance"]),
        defaultValue: "",
      },
      pan: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      aadhaar: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      electricity_bill: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      rent_agreement: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      house: {
        type: DataTypes.ENUM(["rented", "owned", "parental"]),
        allowNull: true,
      },
      landmark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      alt_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      references: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      permanent_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      present_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guarantor: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      co_applicant: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      guarantor_aadhaar: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["vehicle_id"] },
        { fields: ["enquiry_code"] },
        { fields: ["dealer_id"] },
        { fields: ["name"] },
        { fields: ["phone"] },
        { fields: ["location"] },
        { fields: ["status"] },
        { fields: ["purchase_type"] },
        { fields: ["landmark"] },
        { fields: ["alt_phone"] },
        { fields: ["references"] },
        { fields: ["permanent_address"] },
        { fields: ["present_address"] },
        { fields: ["guarantor"] },
        { fields: ["co_applicant"] },
        { fields: ["enquiry_type"] },
        { fields: ["email"] },
      ],
    }
  );

  await WalkInEnquiryModel.sync({ alter: true });
};

const create = async (req) => {
  const latest = await WalkInEnquiryModel.findOne({
    attributes: ["enquiry_code"],
    order: [["created_at", "DESC"]],
    raw: true,
  });

  let newEnqCode = "ENQ-0001";
  if (latest?.enquiry_code) {
    const number = parseInt(latest.enquiry_code.split("-")[1]);
    const nextNumber = number + 1;
    newEnqCode = `ENQ-${String(nextNumber).padStart(4, "0")}`;
  }

  return await WalkInEnquiryModel.create({
    dealer_id: req.body?.dealer_id ?? null,
    enquiry_code: newEnqCode,
    vehicle_id: req.body.vehicle_id,
    quantity: req.body.quantity,
    message: req.body.message,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    location: req.body.location,
    enquiry_type: req.body.enquiry_type,

    purchase_type: req.body.purchase_type,
    pan: req.body.pan,
    aadhaar: req.body.aadhaar,
    electricity_bill: req.body.electricity_bill,
    rent_agreement: req.body.rent_agreement,

    house: req.body.house,
    landmark: req.body.landmark,
    alt_phone: req.body.alt_phone,
    references: req.body.references,
    permanent_address: req.body.permanent_address,
    present_address: req.body.present_address,
    guarantor: req.body.guarantor,
    co_applicant: req.body.co_applicant,
    guarantor_aadhaar: req.body.guarantor_aadhaar,
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
      `(enq.name ILIKE :query OR enq.enquiry_code ILIKE :query OR enq.location ILIKE :query OR enq.phone ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  const enquiryType = req.query?.enqt ?? null;
  if (enquiryType) {
    whereConditions.push(`enq.enquiry_type = :enquiryType`);
    queryParams.enquiryType = enquiryType;
  }

  const status = req.query.status ? req.query.status.split(".") : null;
  if (status?.length) {
    whereConditions.push(`enq.status = any(:status)`);
    queryParams.status = `{${status.join(",")}}`;
  }

  const mode = req.query.mode ? req.query.mode.split(".") : null;
  if (mode?.length) {
    whereConditions.push(`enq.purchase_type = any(:mode)`);
    queryParams.mode = `{${mode.join(",")}}`;
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
      FROM ${constants.models.WALKIN_ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
      ${whereClause}
      `;

  let query = `
      SELECT
        enq.*, vh.title as vehicle_name, 
        CASE 
          WHEN dlrusr.id IS NOT NULL THEN 
          CONCAT(dlrusr.first_name, ' ', dlrusr.last_name) ELSE null 
          END as dealership, dlr.dealer_code
      FROM ${constants.models.WALKIN_ENQUIRY_TABLE} enq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = enq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = enq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} dlrusr ON dlrusr.id = dlr.user_id
      ${whereClause}
      ORDER BY enq.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

  const data = await WalkInEnquiryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await WalkInEnquiryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { enquiries: data, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await WalkInEnquiryModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await WalkInEnquiryModel.update(
    {
      status: req.body.status,
      dealer_id: req.body.dealer_id,
      vehicle_id: req.body.vehicle_id,
      message: req.body.message,
      name: req.body.name,
      phone: req.body.phone,
      location: req.body.location,
      purchase_type: req.body.purchase_type,
      pan: req.body.pan,
      aadhaar: req.body.aadhaar,
      electricity_bill: req.body.electricity_bill,
      rent_agreement: req.body.rent_agreement,

      house: req.body.house,
      landmark: req.body.landmark,
      alt_phone: req.body.alt_phone,
      references: req.body.references,
      permanent_address: req.body.permanent_address,
      present_address: req.body.present_address,
      guarantor: req.body.guarantor,
      co_applicant: req.body.co_applicant,
      guarantor_aadhaar: req.body.guarantor_aadhaar,
    },
    options
  );
};

const deleteById = async (req, id, transaction) => {
  const options = {
    where: { id: req.params.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await WalkInEnquiryModel.destroy(options);
};

const getEnquiriesOverTime = async (days = 7) => {
  // Query last `n` days of enquiry data grouped by date
  const result = await WalkInEnquiryModel.findAll({
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
      FROM ${constants.models.WALKIN_ENQUIRY_TABLE} eq
      LEFT JOIN ${constants.models.VEHICLE_TABLE} vh ON vh.id = eq.vehicle_id
      LEFT JOIN ${constants.models.DEALER_TABLE} dlr ON dlr.id = eq.dealer_id
      LEFT JOIN ${constants.models.USER_TABLE} usr ON usr.id = dlr.user_id
      ORDER BY eq.created_at DESC
      LIMIT :limit
    `;

  return await WalkInEnquiryModel.sequelize.query(query, {
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
