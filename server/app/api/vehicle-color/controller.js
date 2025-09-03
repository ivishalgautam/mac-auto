"use strict";
import { StatusCodes } from "http-status-codes";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import constants from "../../lib/constants/index.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const colorHex = req.body.color_hex;
    const vehicleId = req.body.vehicle_id;
    const vehicleVariantId = req.body.variant_id;
    const chassisNumbers = req.body.chassis_numbers;

    let colorRecord = await table.VehicleColorModel.getByColorAndVehicleId(
      colorHex,
      vehicleId
    );
    if (!colorRecord) {
      colorRecord = await table.VehicleColorModel.create(req, transaction);
    } else {
      await cleanupFiles(req.filePaths);
    }

    const variantRecord = await table.VehicleVariantModel.getById(
      0,
      vehicleVariantId
    );
    if (!variantRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Variant not found." });

    let vehicleVariantMapRecord =
      await table.VehicleVariantMapModel.getByVariantAndVehicleId(
        vehicleVariantId,
        vehicleId
      );
    if (!vehicleVariantMapRecord) {
      vehicleVariantMapRecord = await table.VehicleVariantMapModel.create(
        {
          body: { vehicle_id: vehicleId, vehicle_variant_id: vehicleVariantId },
        },
        transaction
      );
    }

    if (chassisNumbers && chassisNumbers.length) {
      const bulkData = chassisNumbers.map((c) => ({
        vehicle_color_id: colorRecord.id,
        vehicle_variant_map_id: vehicleVariantMapRecord.id,
        vehicle_id: colorRecord.vehicle_id,
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
    await transaction.rollback();
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.VehicleColorModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    await table.VehicleColorModel.deleteById(req, transaction);
    const filesToDelete = [
      ...(record?.carousel ?? []),
      ...(record?.gallery ?? []),
    ];

    await cleanupFiles(filesToDelete);
    await transaction.commit();
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const vehicleVariantId = req.body.variant_id;
    const vehicleId = req.body.vehicle_id;
    const chassisNumbers = req.body?.chassis_numbers ?? [];

    const record = await table.VehicleColorModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    const documentsToDelete = [];

    const existingCarouselDocs = record.carousel;
    const updatedCarouselDocs = req.body.carousel_urls;
    if (updatedCarouselDocs) {
      req.body.carousel = [
        ...(req.body?.carousel ?? []),
        ...updatedCarouselDocs,
      ];
      documentsToDelete.push(
        ...getItemsToDelete(existingCarouselDocs, updatedCarouselDocs)
      );
    }

    const existingGalleryDocs = record.gallery;
    const updatedGalleryDocs = req.body.gallery_urls;
    if (updatedGalleryDocs) {
      req.body.gallery = [...(req.body?.gallery ?? []), ...updatedGalleryDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingGalleryDocs, updatedGalleryDocs)
      );
    }

    await table.VehicleColorModel.update(req, 0, transaction);
    if (documentsToDelete.length) {
      await cleanupFiles(documentsToDelete);
    }

    const variantRecord = await table.VehicleVariantModel.getById(
      0,
      vehicleVariantId
    );
    if (!variantRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Variant not found." });

    let vehicleVariantMapRecord =
      await table.VehicleVariantMapModel.getByVariantAndVehicleId(
        vehicleVariantId,
        vehicleId
      );
    if (!vehicleVariantMapRecord) {
      vehicleVariantMapRecord = await table.VehicleVariantMapModel.create(
        {
          body: { vehicle_id: vehicleId, vehicle_variant_id: vehicleVariantId },
        },
        transaction
      );
    }

    if (chassisNumbers && chassisNumbers.length) {
      const bulkData = chassisNumbers.map((c) => ({
        vehicle_color_id: record.id,
        vehicle_variant_map_id: vehicleVariantMapRecord.id,
        vehicle_id: record.vehicle_id,
        chassis_no: c.number,
        motor_no: c.motor_no,
        battery_no: c.battery_no,
        controller_no: c.controller_no,
        charger_no: c.charger_no,
      }));

      await table.InventoryModel.bulkCreate(bulkData, transaction);
    }

    await transaction.commit();
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.VehicleColorModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const importVehicles = async (req, res) => {
  try {
    const vehicles = await table.VehicleColorModel.getAll([
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
  deleteById: deleteById,
  update: update,
  getById: getById,
  importVehicles: importVehicles,
};
