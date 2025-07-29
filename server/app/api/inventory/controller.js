"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import constants from "../../lib/constants/index.js";
import { inventorySchema } from "./schema.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const vehicleId = req.params.vehicle_id;
    const validateData = inventorySchema.parse(req.body);
    const record = await table.VehicleModel.getById(0, vehicleId);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found" });

    const chassisData = validateData.chassis_numbers.map((chassis) => ({
      vehicle_id: vehicleId,
      chassis_no: chassis.number,
      motor_no: chassis.motor_no,
      battery_no: chassis.battery_no,
      controller_no: chassis.controller_no,
      charger_no: chassis.charger_no,
    }));
    await table.InventoryModel.bulkCreate(chassisData, transaction);
    await transaction.commit();

    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getByVehicleId = async (req, res) => {
  try {
    const vehicleId = req.params.vehicle_id;

    const record = await table.VehicleModel.getById(0, vehicleId);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found" });

    const data = await table.InventoryModel.getByVehicleId(req, vehicleId);

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.InventoryModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Inventory not found" });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.InventoryModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Inventory Item not found" });

    const data = await table.InventoryModel.update(req);
    res.code(status.OK).send({ status: true, message: "Updated" });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  getByVehicleId: getByVehicleId,
  update: update,
  getById: getById,
};
