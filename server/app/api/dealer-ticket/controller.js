"use strict";
import table from "../../db/models.js";
import { ticketSchema } from "./schema.js";
import constants from "../../lib/constants/index.js";
import { sequelize } from "../../db/postgres.js";
import { getItemsToDelete } from "../../helpers/filter.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  try {
    const validateData = ticketSchema.parse(req.body);
    const { role, id } = req.user_data;
    const dealerId = ["admin", "cre"].includes(role) ? req.body.dealer_id : id;

    let dealerRecord = null;

    if (["admin", "cre", "manager"].includes(role)) {
      dealerRecord = await table.DealerModel.getById(dealerId);
    } else {
      dealerRecord = await table.DealerModel.getByUserId(dealerId);
    }

    if (!dealerRecord)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Dealer not found!" });

    const creUsers = await table.UserModel.getCREs();
    if (!creUsers.length)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Please create atleast 1 CRE." });

    const lastCREAssignedTicket =
      await table.DealerTicketModel.getLastCREAssignedTicket();

    let creToBeAssign = null;
    if (creUsers.length > 0) {
      const assignedCREIndex = creUsers.findIndex(
        (c) => c.id === lastCREAssignedTicket?.assigned_cre
      );

      creToBeAssign =
        assignedCREIndex + 1 > creUsers.length - 1
          ? creUsers[0]
          : creUsers[assignedCREIndex + 1];
    }
    if (role === "cre") {
      req.body.assigned_cre = id;
    } else {
      req.body.assigned_cre = creToBeAssign.id;
    }

    await table.DealerTicketModel.create({
      body: { ...req.body, dealer_id: dealerRecord.id },
    });

    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.DealerTicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getDetailsById = async (req, res) => {
  try {
    const record = await table.DealerTicketModel.getTicketDetailsById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.DealerTicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    const documentsToDelete = [];

    const existingDocs = record.job_card;
    const updatedDocs = req.body.job_card_urls;
    if (updatedDocs) {
      req.body.job_card = [...(req.body?.job_card ?? []), ...updatedDocs];
      documentsToDelete.push(...getItemsToDelete(existingDocs, updatedDocs));
    }

    const existingImageDocs = record.images;
    const updatedImageDocs = req.body.images_urls;
    if (updatedImageDocs) {
      req.body.images = [...(req.body?.images ?? []), ...updatedImageDocs];
      documentsToDelete.push(
        ...getItemsToDelete(existingImageDocs, updatedImageDocs)
      );
    }

    await table.DealerTicketModel.update(req, 0, transaction);

    if (documentsToDelete.length) await cleanupFiles(documentsToDelete);

    await transaction.commit();

    res.send({ status: true, message: "Updated" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.DealerTicketModel.getById(req);
    if (!record) return res.code(404).send({ message: "Ticket not found!" });

    await table.DealerTicketModel.deleteById(req);

    res.send({ status: true, message: "Ticket deleted" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.DealerTicketModel.get(req);
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
