"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { dealerInventorySchema } from "./schema.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;

const get = async (req, res) => {
  try {
    const data = await table.DealerModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getDealerInventory = async (req, res) => {
  try {
    const data = await table.DealerInventoryModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getInventoryByVehicleId = async (req, res) => {
  try {
    const vehicleId = req.params.vehicle_id;

    const record = await table.VehicleModel.getById(0, vehicleId);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found" });

    const data = await table.DealerInventoryModel.getByVehicleId(
      req,
      vehicleId
    );

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};
const getInventoryByVehicleColorId = async (req, res) => {
  try {
    const vehicleColorId = req.params.vehicle_color_id;

    const record = await table.VehicleColorModel.getById(0, vehicleColorId);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found" });

    const data = await table.DealerInventoryModel.getByVehicleColorId(
      req,
      vehicleColorId
    );

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const getColors = async (req, res) => {
  try {
    const vehicleId = req.params.vehicle_id;

    const record = await table.VehicleModel.getById(0, vehicleId);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Vehicle not found" });

    const data = await table.DealerInventoryModel.getColors(req, vehicleId);

    res.code(status.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const createInventory = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = dealerInventorySchema.parse(req.body);
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

    await table.OrderModel.create(req, transaction);
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

const updateDealerInventory = async (req, res) => {
  try {
    const record = await table.DealerInventoryModel.getById(req.params.id);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Inventory Item not found" });

    const data = await table.DealerInventoryModel.update(req, req.params.id);
    res.code(status.OK).send({ status: true, message: "Updated" });
  } catch (error) {
    throw error;
  }
};

const getInventoryItemById = async (req, res) => {
  try {
    const record = await table.DealerInventoryModel.getById(req.params.id);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Inventory not found" });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

export default {
  get: get,
  getDealerInventory: getDealerInventory,
  createInventory: createInventory,
  getInventoryByVehicleId: getInventoryByVehicleId,
  getInventoryByVehicleColorId: getInventoryByVehicleColorId,
  updateDealerInventory: updateDealerInventory,
  getInventoryItemById: getInventoryItemById,
  getColors: getColors,
};
