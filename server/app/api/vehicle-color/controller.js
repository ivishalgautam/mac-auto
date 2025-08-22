"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const chassisNumbers = req.body.chassis_numbers;

    const newColor = await table.VehicleColorModel.create(req, transaction);

    console.log({ newColor });
    if (chassisNumbers && chassisNumbers.length) {
      const bulkData = chassisNumbers.map((c) => ({
        vehicle_color_id: newColor.id,
        vehicle_id: newColor.vehicle_id,
        chassis_no: c.number,
        motor_no: c.motor_no,
        battery_no: c.battery_no,
        controller_no: c.controller_no,
        charger_no: c.charger_no,
      }));

      await table.InventoryModel.bulkCreate(bulkData, transaction);
    }

    await transaction.commit();
    return res.code(201).send({ success: true, data: "Variant added." });
  } catch (error) {
    if (req.filePaths.length) {
      await cleanupFiles(req.filePaths);
    }
    await transaction.rollback();
    throw error;
  }
};

const importVehicles = async (req, res) => {
  try {
    const vehicles = await table.VehicleModel.getAll([
      "id",
      "carousel",
      "gallery",
    ]);

    const data = vehicles.map((v) => ({
      vehicle_id: v.id,
      color_name: "White",
      color_hex: "#FFFFFF",
      carousel: v.carousel,
      gallery: v.gallery,
    }));

    return await table.VehicleColorModel.bulkCreate(data);
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  importVehicles: importVehicles,
};
