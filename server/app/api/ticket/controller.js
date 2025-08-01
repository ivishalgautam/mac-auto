"use strict";
import table from "../../db/models.js";
import { ticketSchema } from "./schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import constants from "../../lib/constants/index.js";
import { sequelize } from "../../db/postgres.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const filePaths = req.filePaths;
  try {
    const validateData = ticketSchema.parse(req.body);
    const purchaseRecord = await table.CustomerPurchaseModel.getById(
      validateData.purchase_id
    );
    if (!purchaseRecord)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Purchase record not found!" });

    await table.TicketModel.create(req);

    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    if (filePaths.length) {
      await cleanupFiles(filePaths);
    }
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.TicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  const filePaths = req.filePaths;

  try {
    const record = await table.TicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    await table.TicketModel.update(req, 0, transaction);

    const documentsToDelete = [];

    const existingImages = record.images;
    const updatedImages = req.body.image_urls;
    if (updatedImages) {
      req.body.images = [...(req.body?.images ?? []), ...updatedImages];
      documentsToDelete.push(
        ...getItemsToDelete(existingImages, updatedImages)
      );
    }

    if (documentsToDelete.length) {
      await cleanupFiles(documentsToDelete);
    }

    await transaction.commit();
    res.send({ status: true, message: "Updated" });
  } catch (error) {
    await transaction.rollback();
    if (filePaths.length) {
      await cleanupFiles(filePaths);
    }
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    res.send(await table.TicketModel.deleteById(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.TicketModel.get(req);
    res.send({ status: true, data: data, total: data?.[0]?.total });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default {
  create: create,
  getById: getById,
  deleteById: deleteById,
  get: get,
  update: update,
};
