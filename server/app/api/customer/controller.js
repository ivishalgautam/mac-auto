"use strict";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import { assignCustomerToDealer } from "./schema.js";

const status = constants.http.status;

const get = async (req, res) => {
  try {
    const data = await table.CustomerModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getDealerCustomers = async (req, res) => {
  try {
    const data = await table.CustomerDealersModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const assignToDealer = async (req, res) => {
  try {
    const validateData = assignCustomerToDealer.parse(req.body);
    const record = await table.CustomerDealersModel.getByCustomerAndDealer({
      body: validateData,
    });

    if (record)
      return res
        .code(status.CONFLICT)
        .send({ status: false, message: "Already assigned." });

    const data = await table.CustomerDealersModel.create({
      body: validateData,
    });
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getCustomerPurchases = async (req, res) => {
  try {
    const data = await table.CustomerPurchaseModel.get(req);
    res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

export default {
  getDealerCustomers: getDealerCustomers,
  get: get,
  assignToDealer: assignToDealer,
  getCustomerPurchases: getCustomerPurchases,
};
