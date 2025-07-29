"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { dealerOrderSchema } from "./schema.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = dealerOrderSchema.parse(req.body);
    const dealerRecord = await table.DealerModel.getById(
      validateData.dealer_id
    );
    if (!dealerRecord) {
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Dealer not found!" });
    }
    const vehicleRecord = await table.VehicleModel.getById(
      0,
      validateData.vehicle_id
    );
    if (!vehicleRecord) {
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found!" });
    }

    // const bulkAddData = validateData.chassis_numbers.map((no) => ({
    //   vehicle_id: validateData.vehicle_id,
    //   dealer_id: validateData.dealer_id,
    //   chassis_no: no,
    //   status: "active",
    // }));
    // await table.DealerInventoryModel.bulkCreate(bulkAddData, transaction);

    const data = await table.DealerOrderModel.create(req, transaction);
    await table.InventoryModel.bulkUpdateStatusByChassisNos(
      validateData.chassis_numbers,
      "sold",
      transaction
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.DealerOrderModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const orderStatus = req.body.status;
    const chassis_numbers = req.body.chassis_numbers;

    const data = await table.DealerOrderModel.getById(req);
    if (!data)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    if (orderStatus === "in process") {
      return res.code(status.BAD_REQUEST).send({
        status: false,
        message: `Order is '${data.status === "dispatch" ? "Dispatched" : data.status}' can't change status.`,
      });
    }

    if (data.status !== orderStatus && data.status === "canceled") {
      return res
        .code(status.BAD_REQUEST)
        .send({ status: false, message: "Order canceled." });
    }

    if (orderStatus === "canceled") {
      await table.InventoryModel.bulkUpdateStatusByChassisNos(
        data.chassis_nos,
        "active",
        transaction
      );
    }

    await table.DealerOrderModel.update(req, 0, transaction);

    await transaction.commit();
    res.code(status.OK).send({ status: true, message: "Order Updated." });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const data = await table.DealerOrderModel.getById(req);
    if (!data)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.DealerOrderModel.deleteById(req, 0, transaction);
    if (data.status === "in process") {
      await table.InventoryModel.bulkUpdateStatus(
        data.chassis_nos,
        "active",
        transaction
      );
    }
    await transaction.commit();
    res.code(status.OK).send({ status: true, message: "Order Deleted." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getChassisDetailsOfOrder = async (req, res) => {
  try {
    const record = await table.DealerOrderModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    const data = await table.DealerOrderModel.getChassisDetailsOfOrder(req);

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

export default {
  get: get,
  create: create,
  update: update,
  deleteById: deleteById,
  getChassisDetailsOfOrder: getChassisDetailsOfOrder,
};
