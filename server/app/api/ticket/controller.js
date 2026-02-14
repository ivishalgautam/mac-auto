"use strict";
import table from "../../db/models.js";
import { ticketSchema } from "./schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import constants from "../../lib/constants/index.js";
import { sequelize } from "../../db/postgres.js";
import { getItemsToDelete } from "../../helpers/filter.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const filePaths = req.filePaths;

  try {
    const { role, id } = req.user_data;
    const validateData = ticketSchema.parse(req.body);
    req.body.customer_id = role === "customer" ? id : validateData.customer_id;

    const lastCREAssignedTicket =
      await table.TicketModel.getLastCREAssignedTicket();

    let creToBeAssign = null;

    if (req.user_data.role === "customer") {
      const creUsers = await table.UserModel.getCREs();
      if (creUsers.length > 0) {
        const assignedCREIndex = creUsers.findIndex(
          (c) => c.id === lastCREAssignedTicket?.assigned_cre
        );

        creToBeAssign =
          assignedCREIndex + 1 > creUsers.length - 1
            ? creUsers[0]
            : creUsers[assignedCREIndex + 1];
      }
    }

    if (req.user_data.role === "cre") {
      req.body.assigned_cre = req.user_data.id;
    } else if (req.user_data.role === "customer") {
      req.body.assigned_cre = creToBeAssign?.id ?? null;
    } else {
      req.body.assigned_cre = validateData.assigned_cre;
    }

    await table.TicketModel.create(req);

    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    if (filePaths?.length) {
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

const getDetailsById = async (req, res) => {
  try {
    const record = await table.TicketModel.getTicketDetailsById(req);
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
    const updatedImages = req.body.images_urls;
    if (updatedImages) {
      req.body.images = [...(req.body?.images ?? []), ...updatedImages];
      documentsToDelete.push(
        ...getItemsToDelete(existingImages, updatedImages)
      );
    }

    const existingVideos = record.videos;
    const updatedVideos = req.body.videos_urls;
    if (updatedVideos) {
      req.body.videos = [...(req.body?.videos ?? []), ...updatedVideos];
      documentsToDelete.push(
        ...getItemsToDelete(existingVideos, updatedVideos)
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
  const transaction = await sequelize.transaction();
  try {
    const record = await table.TicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    await table.TicketModel.deleteById(req, 0, transaction);
    await cleanupFiles(record?.images ?? []);
    await transaction.commit();

    res.send({ status: true, message: "Ticket deleted" });
  } catch (error) {
    await transaction.rollback();
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
  getDetailsById: getDetailsById,
  deleteById: deleteById,
  get: get,
  update: update,
};
