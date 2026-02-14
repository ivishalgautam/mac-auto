"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let PDICheckModel = null;

const init = async (sequelize) => {
  PDICheckModel = sequelize.define(
    constants.models.PDI_CHECK_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      dealer_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.DEALER_ORDER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      pdi: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      pdi_incharge: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      pdi_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      images: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      invoices: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["dealer_order_id"] }, { fields: ["pdi_by"] }],
    }
  );

  return PDICheckModel;
  await PDICheckModel.sync({ alter: true });
};

const create = async (req, dealer_order_id, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await PDICheckModel.create(
    {
      pdi: req.body.pdi,
      pdi_incharge: req.body.pdi_incharge,
      dealer_order_id: dealer_order_id,
      images: req.body.images,
      pdi_by: req.user_data.id,
      invoices: req.body.invoices,
    },
    options
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;
  return await PDICheckModel.update(
    {
      pdi: req.body.pdi,
      pdi_incharge: req.body.pdi_incharge,
      images: req.body.images,
      invoices: req.body.invoices,
    },
    options
  );
};

const getById = async (req, id) => {
  return await PDICheckModel.findOne({
    where: {
      id: req.params?.id || id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const isPDIExist = async (orderId, pdiBy) => {
  const record = await PDICheckModel.findOne({
    where: {
      dealer_order_id: orderId,
      pdi_by: pdiBy,
    },
  });
  return !!record;
};

const deleteById = async (id) => {
  return await PDICheckModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  deleteById: deleteById,
  isPDIExist: isPDIExist,
};
