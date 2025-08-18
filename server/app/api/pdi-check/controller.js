"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const orderRecord = await table.DealerOrderModel.getById(req);
    if (!orderRecord) {
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Order not found!" });
    }

    const isPDIExist = await table.PDICheckModel.isPDIExist(
      orderRecord.id,
      req.user_data.id
    );
    if (isPDIExist)
      return res
        .code(status.CONFLICT)
        .send({ status: false, message: "PDI Created already." });

    await table.PDICheckModel.create(req, req.params.id, transaction);
    await table.DealerOrderModel.update(
      {
        body: {
          status: req.user_data.role === "admin" ? "dispatch" : "delivered",
        },
      },
      orderRecord.id,
      transaction
    );

    if (req.user_data.role === "dealer") {
      const bulkAddData = orderRecord.chassis_nos.map((no) => ({
        vehicle_id: orderRecord.vehicle_id,
        vehicle_color_id: orderRecord.vehicle_color_id,
        dealer_id: orderRecord.dealer_id,
        chassis_no: no,
        status: "active",
      }));

      await table.DealerInventoryModel.bulkCreate(bulkAddData, transaction);
    }

    await transaction.commit();
    res.code(status.OK).send({ status: true, message: "PDI created." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const pdiRecord = await table.PDICheckModel.getById(req);
    if (!pdiRecord) {
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "PDI not found!" });
    }

    if (req.user_data.id !== pdiRecord.pdi_by)
      return res.code(status.CONFLICT).send({
        status: false,
        message: "This is not your PDI You can't update it.",
      });

    const data = await table.PDICheckModel.update(
      { body: { pdi: req.body.pdi, pdi_incharge: req.body.pdi_incharge } },
      req.params.id,
      transaction
    );

    await transaction.commit();
    res.code(status.OK).send({ status: true, message: "PDI Updated." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const data = await table.PDICheckModel.getById(req);
    if (!data)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "PDI not found." });

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const data = await table.PDICheckModel.getById(req);
    if (!data)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "PDI not found." });

    await table.PDICheckModel.deleteById(req);

    res.code(status.OK).send({ status: true, message: "PDI Deleted." });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  update: update,
  getById: getById,
  deleteById: deleteById,
};
