"use strict";
import table from "../../db/models.js";
import { ticketSchema } from "./schema.js";
import constants from "../../lib/constants/index.js";
import { sequelize } from "../../db/postgres.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  try {
    const validateData = ticketSchema.parse(req.body);
    const dealerRecord = await table.DealerModel.getByUserId(req.user_data.id);
    if (!dealerRecord)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: "Dealer not found!" });
    console.log({ dealerRecord });

    const lastCREAssignedTicket =
      await table.DealerTicketModel.getLastCREAssignedTicket();
    const creUsers = await table.UserModel.getCREs();

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
    if (req.user_data.role === "cre") {
      req.body.assigned_cre = req.user_data.id;
    } else {
      req.body.assigned_cre = creToBeAssign.id;
    }

    await table.DealerTicketModel.create({
      body: { ...validateData, dealer_id: dealerRecord.id },
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

    await table.DealerTicketModel.update(req, 0, transaction);
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
