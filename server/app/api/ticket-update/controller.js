"use strict";
import table from "../../db/models.js";
import { ticketUpdateSchema } from "../../validation-schema/ticket-update-schema.js";

const create = async (req, res) => {
  try {
    const validateData = ticketUpdateSchema.parse(req.body);
    res.send(await table.TicketUpdateModel.create(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.TicketUpdateModel.getById(req);
    if (!record)
      return res.code(404).send({ message: "Ticket update not found!" });

    res.send(record);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getByTicket = async (req, res) => {
  try {
    res.send({
      status: true,
      data: (await table.TicketUpdateModel.getByTicket(req)) ?? [],
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TicketUpdateModel.getById(req);
    if (!record)
      return res.code(404).send({ message: "Ticket update not found!" });

    res.send(await table.TicketUpdateModel.deleteById(req));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.TicketUpdateModel.update(req);
    if (!record)
      return res.code(404).send({ message: "Ticket update not found!" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.TicketUpdateModel.get(req);
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
  update: update,
  get: get,
  getByTicket: getByTicket,
};
