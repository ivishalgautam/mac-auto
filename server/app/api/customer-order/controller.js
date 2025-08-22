"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { customerOrderSchema } from "./schema.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = customerOrderSchema.parse(req.body);
    const customerRecord = await table.CustomerModel.getById(
      0,
      validateData.customer_id
    );
    if (!customerRecord) {
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Customer not found!" });
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

    const dealerRecord = await table.DealerModel.getByUserId(req.user_data.id);
    if (!dealerRecord)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Dealer not found!" });

    await table.CustomerPurchaseModel.create(
      {
        body: {
          vehicle_id: validateData.vehicle_id,
          vehicle_color_id: validateData.vehicle_color_id,
          customer_id: validateData.customer_id,
          dealer_id: dealerRecord.id,
          chassis_no: validateData.chassis_number,
        },
      },
      transaction
    );
    await table.DealerInventoryModel.updateStatusByChassisNo(
      validateData.chassis_number,
      "sold",
      transaction
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  create: create,
};
