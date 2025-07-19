"use strict";
import slugify from "slugify";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import { vehicleSchema, vehicleUpdateSchema } from "./schema.js";
import { sequelize } from "../../db/postgres.js";
import colorNamer from "color-namer";
import { getItemsToDelete } from "../../helpers/filter.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { stateCityData, uniqueStates } from "../../data/state-city-data.js";

const status = constants.http.status;
const responseMessage = constants.error.message;

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validateData = vehicleSchema.parse(req.body);
    req.body.slug = slugify(validateData.title, {
      lower: true,
      strict: true,
      remove: /['"]/g,
    });

    // ! remove this after adding all vehicles
    req.body.pricing = uniqueStates.map((stateName) => {
      return {
        name: stateName,
        base_price: validateData.base_price,
        cities: stateCityData
          .filter((item) => item.state.toLowerCase() === stateName)
          .map((item) => ({
            name: item.city.toLowerCase(),
            price_modifier: 0,
          })),
      };
    });

    const vehicleData = await table.VehicleModel.create(req, transaction);
    if (vehicleData) {
      const chassisData = validateData.chassis_numbers.map(({ number }) => ({
        vehicle_id: vehicleData.id,
        chassis_no: number,
      }));
      await table.InventoryModel.bulkCreate(chassisData, transaction);
    }
    await transaction.commit();
    res
      .code(status.CREATED)
      .send({ status: true, message: responseMessage[status.CREATED] });
  } catch (error) {
    await transaction.rollback();
    if (req.filePaths.length) {
      await cleanupFiles(req.filePaths);
    }
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    const validateData = vehicleUpdateSchema.parse(req.body);
    req.body.slug = slugify(validateData.title, {
      lower: true,
      strict: true,
      remove: /['"]/g,
    });

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

    // ! remove this after adding all vehicles
    req.body.pricing = uniqueStates.map((stateName) => {
      return {
        name: stateName,
        base_price: parseInt(req.body.base_price),
        cities: stateCityData
          .filter((item) => item.state.toLowerCase() === stateName)
          .map((item) => ({
            name: item.city.toLowerCase(),
            price_modifier: 0,
          })),
      };
    });

    await table.VehicleModel.update(req, 0, transaction);
    if (documentsToDelete.length) {
      await cleanupFiles(documentsToDelete);
    }

    await transaction.commit();
    res
      .code(status.OK)
      .send({ status: true, message: responseMessage[status.OK] });
  } catch (error) {
    await transaction.rollback();
    if (req.filePaths.length) {
      await cleanupFiles(req.filePaths);
    }
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    await table.VehicleModel.deleteById(req, transaction);
    const filesToDelete = [
      ...(record?.carousel ?? []),
      ...(record?.gallery ?? []),
    ];

    record.features?.forEach((item) => {
      if (item.image) {
        filesToDelete.push(item.image);
      }
    });

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

const getById = async (req, res) => {
  try {
    const record = await table.VehicleModel.getById(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const getBySlug = async (req, res) => {
  console.log(req.ip);
  try {
    const record = await table.VehicleModel.getBySlug(req);
    if (!record)
      return res
        .code(status.NOT_FOUND)
        .send({ status: false, message: responseMessage[status.NOT_FOUND] });

    res.code(status.OK).send({
      status: true,
      data: {
        ...record,
        faqs: [
          {
            question:
              "What is the range of your electric rickshaws on a full charge?",
            answer:
              "Our electric rickshaws offer a range of 80–120 km per full charge, depending on road conditions, load, and battery type.",
          },
          {
            question: "How long does it take to fully charge the battery?",
            answer:
              "Charging time varies by battery type: Lead-acid battery takes 6–8 hours, while Lithium-ion battery takes 3–4 hours.",
          },
          {
            question: "What is the battery life expectancy?",
            answer:
              "Lead-acid batteries typically last 1.5–2 years, whereas lithium-ion batteries can last 3–5 years depending on usage and maintenance.",
          },
          {
            question: "Are the rickshaws RTO-approved and road legal?",
            answer:
              "Yes, all our EV rickshaws are RTO-approved and fully compliant with government regulations for public transport.",
          },
          {
            question: "What type of battery do you use? Can I upgrade later?",
            answer:
              "We offer both lead-acid and lithium-ion battery options. You can upgrade to a lithium-ion battery later with minor adjustments.",
          },
          {
            question: "Do you provide after-sales service and warranty?",
            answer:
              "Yes, we provide 1-year warranty on the vehicle and extended support for battery and spare parts as per the chosen package.",
          },
          {
            question: "What is the maximum speed of your e-rickshaws?",
            answer:
              "Our electric rickshaws have a top speed of 25–30 km/h, depending on the model and load conditions.",
          },
          {
            question: "Can I customize the design or branding of the rickshaw?",
            answer:
              "Yes, we offer customization options including color, seating layout, and brand decals for bulk or fleet orders.",
          },
          {
            question: "Do you offer financing or EMI options?",
            answer:
              "Yes, we have partnered with multiple NBFCs and banks to provide easy financing and EMI options for eligible customers.",
          },
          {
            question: "Where can I get spare parts or service support?",
            answer:
              "We have a network of authorized service centers and also provide doorstep service and genuine spare parts through our dealers.",
          },
        ],
      },
    });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const record = await table.VehicleModel.get(req);
    res.code(status.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  getById: getById,
  get: get,
  getBySlug: getBySlug,
};
