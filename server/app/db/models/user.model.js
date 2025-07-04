"use strict";
import constants from "../../lib/constants/index.js";
import hash from "../../lib/encryption/index.js";
import { DataTypes, QueryTypes } from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let UserModel = null;

const init = async (sequelize) => {
  UserModel = sequelize.define(
    constants.models.USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email address already in use.",
        },
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: {
          args: true,
          msg: "Mobile number already in use.",
        },
      },
      first_name: {
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: DataTypes.ENUM({
          values: ["super_admin", "admin", "dealer", "customer", "user"],
        }),
        defaultValue: "user",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      provider: {
        type: DataTypes.STRING,
        defaultValue: "credentials",
      },
      provider_account_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_password_token: {
        type: DataTypes.STRING,
      },
      confirmation_token: {
        type: DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await UserModel.sync({ alter: true });
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;
  const hash_password = req.body.password
    ? hash.encrypt(req.body.password)
    : "";

  const data = await UserModel.create(
    {
      username: req.body.username,
      password: hash_password,
      first_name: req.body?.first_name,
      last_name: req.body?.last_name,
      email: req.body?.email,
      mobile_number: req.body?.mobile_number,
      role: req.body?.role,
      image_url: req?.body?.image_url,
      provider: req?.body?.provider,
      provider_account_id: req?.body?.provider_account_id,
    },
    options
  );

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = ["usr.role != 'admin'"];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  const roles = req.query.role ? req.query.role.split(".") : null;

  if (q) {
    whereConditions.push(
      `(usr.first_name ILIKE :query OR usr.last_name ILIKE :query OR usr.email ILIKE :query)`
    );
    queryParams.query = `%${q}%`;
  }

  if (roles?.length) {
    whereConditions.push(`usr.role = any(:roles)`);
    queryParams.roles = `{${roles.join(",")}}`;
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
    usr.id, CONCAT(usr.first_name, ' ', usr.last_name) as fullname, usr.username, 
    usr.mobile_number, usr.email, usr.role, usr.is_active, usr.created_at
  FROM ${constants.models.USER_TABLE} usr
  ${whereClause}
  ORDER BY usr.created_at DESC
  LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
    COUNT(usr.id) OVER()::integer as total
  FROM ${constants.models.USER_TABLE} usr
  ${whereClause}
  LIMIT :limit OFFSET :offset
  `;

  const users = await UserModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await UserModel.sequelize.query(countQuery, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  return { users, total: count?.[0]?.total ?? 0 };
};

const getById = async (req, user_id) => {
  let query = `
  SELECT
      usr.id, usr.username, usr.first_name, usr.last_name, usr.email, usr.blocked, usr.role, usr.mobile_number, usr.is_verified, usr.image_url
    FROM ${constants.models.USER_TABLE} usr
    WHERE usr.id = :user_id
  `;
  const data = await UserModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { user_id: req?.params?.id || user_id },
    raw: true,
    plain: true,
  });

  return data;
};

const getByUsername = async (req, record = undefined) => {
  let query = `
  SELECT
      usr.id, usr.username, usr.email, usr.first_name, usr.last_name, usr.password, 
      usr.blocked, usr.role, usr.mobile_number, usr.is_verified, usr.image_url, usr.provider
    FROM ${constants.models.USER_TABLE} usr
    WHERE usr.username = :username
  `;

  return await UserModel.sequelize.query(query, {
    replacements: {
      username: req?.body?.username || record?.user?.username,
    },
    raw: true,
    plain: true,
  });
};

const isUsernameExist = async (username) => {
  const user = await UserModel.findOne({ where: { username } });
  return !!user;
};

const isMobileNumberExist = async (mobile_number) => {
  const user = await UserModel.findOne({ where: { mobile_number } });
  return !!user;
};

const isEmailExist = async (email) => {
  const user = await UserModel.findOne({ where: { email } });
  return !!user;
};

const update = async (req, id, transaction = null) => {
  const options = {
    where: {
      id: req.params?.id || id,
    },
    returning: [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "blocked",
      "role",
      "mobile_number",
      "is_verified",
      "image_url",
    ],
    plain: true,
    transaction,
  };

  if (transaction) {
    options.transaction = transaction;
  }

  return await UserModel.update(
    {
      email: req.body?.email,
      first_name: req.body?.first_name,
      last_name: req.body?.last_name,
      role: req.body?.role,
      mobile_number: req.body?.mobile_number,
      image_url: req.body?.image_url,
      is_active: req.body?.is_active,
      is_verified: req.body?.is_verified,
    },
    options
  );
};

const updatePassword = async (req, user_id) => {
  const hash_password = hash.encrypt(req.body.new_password);
  return await UserModel.update(
    {
      password: hash_password,
    },
    {
      where: {
        id: req.params?.id || user_id,
      },
    }
  );
};

const deleteById = async (req, user_id) => {
  return await UserModel.destroy({
    where: {
      id: req?.params?.id || user_id,
    },
    returning: true,
    raw: true,
  });
};

const countUser = async (last_30_days = false) => {
  let where_query;
  if (last_30_days) {
    where_query = {
      createdAt: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }
  return await UserModel.findAll({
    where: where_query,
    attributes: [
      "role",
      [
        UserModel.sequelize.fn("COUNT", UserModel.sequelize.col("role")),
        "total",
      ],
    ],
    group: "role",
    raw: true,
  });
};

const getByEmailId = async (req) => {
  return await UserModel.findOne({
    where: {
      email: req.body.email,
    },
    raw: true,
  });
};

const getByMobileNumber = async (req) => {
  return await UserModel.findOne({
    where: {
      mobile_number: req.body.mobile_number,
    },
    raw: true,
  });
};

const getByResetToken = async (req) => {
  return await UserModel.findOne({
    where: {
      reset_password_token: req.params.token,
    },
  });
};

const getByUserIds = async (user_ids) => {
  return await UserModel.findAll({
    where: {
      id: {
        [Op.in]: user_ids,
      },
    },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  getByUsername: getByUsername,
  update: update,
  updatePassword: updatePassword,
  deleteById: deleteById,
  countUser: countUser,
  getByEmailId: getByEmailId,
  getByResetToken: getByResetToken,
  getByUserIds: getByUserIds,
  getByMobileNumber: getByMobileNumber,
  isMobileNumberExist: isMobileNumberExist,
  isEmailExist: isEmailExist,
  isUsernameExist: isUsernameExist,
};
