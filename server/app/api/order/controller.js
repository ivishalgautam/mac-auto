"use strict";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import { createOrderSchema } from "../../validation-schema/order-schema.js";
import { StatusCodes } from "http-status-codes";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validateData = createOrderSchema.parse(req.body);

    const { role, id } = req.user_data;
    if (role === "dealer") {
      const dealerRecord = await table.DealerModel.getByUserId(id);
      req.body.dealer_id = dealerRecord.id;
    }

    const orderRecord = await table.OrderModel.create(req, transaction);
    const itemRecords = await Promise.all(
      validateData.order_items.map(async (item) => {
        const vehicle = await table.VehicleModel.getById(0, item.vehicle_id);
        if (!vehicle) throw new Error(`Vehicle not found: ${item.vehicle_id}`);

        const colorEntries = item.colors || [];

        return {
          order_id: orderRecord.id,
          vehicle_id: item.vehicle_id,
          battery_type: item.battery_type,
          colors: colorEntries,
        };
      })
    );

    await table.OrderItemModel.bulkCreate(itemRecords, transaction);
    await transaction.commit();

    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Order created successfully" });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.OrderModel.get(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.update(req, 0, transaction);
    if (req.body.order_status === "Canceled") {
      const data = await table.OrderItemModel.getByOrderId(req);
      const updateInventoryPromises = data.items.map(async (item) => {
        const stockRecord = await table.InventoryModel.getById(0, item.item_id);
        return table.InventoryModel.update(
          { body: { stock: stockRecord.stock + item.quantity } },
          item.item_id,
          transaction
        );
      });
      await Promise.all(updateInventoryPromises);
    }
    await transaction.commit();

    res.code(StatusCodes.OK).send({ status: true, message: "Order deleted." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    res.code(StatusCodes.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.deleteById(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Order deleted." });
  } catch (error) {
    throw error;
  }
};

const getOrderItems = async (req, res) => {
  try {
    const data = await table.OrderItemModel.getByOrderId(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  get: get,
  getOrderItems: getOrderItems,
  update: update,
  deleteById: deleteById,
  getById: getById,
};
