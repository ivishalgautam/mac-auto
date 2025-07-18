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
    console.log({ data });
    await table.InventoryModel.bulkUpdateStatus(
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

export default {
  get: get,
  create: create,
};
