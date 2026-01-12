"use strict";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { HttpError } from "../../utils/http-error.js";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian number starting with 6-9",
  }),
  // companyName: z.string().min(1, "Company name is required"),
  // cfDoYouHaveShowroomSpace: z.enum(["Yes", "No"], {
  //   message: "Do You Have Showroom Space is required, select 'Yes' OR 'No'",
  // }),
  // cfInvestmentCapacity: z.string().min(1),
  // email: z.string().email("Invalid email address"),
});

const create = async (req, res) => {
  try {
    const validateData = schema.parse(req.body);

    let data = JSON.stringify({
      firstName: validateData.firstName,
      lastName: validateData.lastName,
      city: validateData.city,
      state: validateData.state,
      phoneNumbers: [
        {
          type: "MOBILE",
          code: "IN",
          primary: true,
          value: validateData.phoneNumber,
        },
      ],
      // companyName: validateData.companyName,
      customFieldValues: {
        cfLeadType: 2561916,
        // cfDoYouHaveShowroomSpace: validateData.cfDoYouHaveShowroomSpace,
        // cfInvestmentCapacity: validateData.cfInvestmentCapacity,
      },
      source: 2561913,
      // emails: [
      //   {
      //     type: "OFFICE",
      //     value: validateData.email,
      //     primary: true,
      //   },
      // ],
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.kylas.io/v1/leads/",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY,
      },
      data: data,
    };

    const response = await axios.request(config);
    return res.send({
      status: true,
      message: "Lead created",
      data: response.data,
    });
  } catch (error) {
    // throw error;
    console.log(error);
    if (error instanceof AxiosError) {
      throw new HttpError(
        error?.response?.data?.message ?? "Something went wrong!",
        error?.response?.status ?? 500
      );
    } else {
      throw error;
    }
  }
};

const downloadBrochureSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  city: z.string().min(1, "City is required"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian number starting with 6-9",
  }),
});

const dowbloadBrochure = async (req, res) => {
  try {
    const validateData = downloadBrochureSchema.parse(req.body);

    let data = JSON.stringify({
      firstName: validateData.firstName,
      lastName: validateData.lastName,
      city: validateData.city,
      phoneNumbers: [
        {
          type: "MOBILE",
          code: "IN",
          primary: true,
          value: validateData.phoneNumber,
        },
      ],
      customFieldValues: {
        cfState: 2579146,
        cfLeadType: 2577535,
      },
      source: 2598600,
      ownerId: 69118,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.kylas.io/v1/leads/",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY,
      },
      data: data,
    };

    const response = await axios.request(config);
    return res.send({
      status: true,
      message: "Lead created",
      data: response.data,
    });
  } catch (error) {
    // throw error;
    console.log(error);

    if (error?.response?.data?.code === "002018")
      return res.code(200).send({ status: true, message: "Success" });

    if (error instanceof AxiosError) {
      throw new HttpError(
        error?.response?.data?.message ?? "Something went wrong!",
        error?.response?.status ?? 500
      );
    } else {
      throw error;
    }
  }
};

const LeadSchema = z.object({
  phoneNumber: z.string().min(10), // from phoneNumbers[0].value
  vehicle_name: z.string(1), // from products[0]
  quantity: z.number().optional().default(1), // from products[0]
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  email: z.string().email().optional().nullable(),
});

const createEnquiryLead = async (req, res) => {
  try {
    // 1️⃣ Validate incoming request
    const validatedData = LeadSchema.parse(req.body);

    // 2️⃣ Build Kylas payload
    const kylasPayload = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      city: validatedData.city,

      phoneNumbers: [
        {
          type: "MOBILE",
          code: "IN",
          primary: true,
          value: validatedData.phoneNumber,
        },
      ],
      // products: [{ id: validatedData.product }],
      customFieldValues: {
        cfLeadType: 2561917,
        // cfState: 2579146,
      },
      source: 2561913,
      requirementName: validatedData.quantity,
      vehicle_name: validatedData.vehicle_name,
    };

    // 4️⃣ API request
    const response = await axios.post(
      "https://api.kylas.io/v1/leads/",
      JSON.stringify(kylasPayload),
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.KYLAS_API_KEY,
        },
        maxBodyLength: Infinity,
      }
    );

    return res.send({
      status: true,
      message: "Lead created",
      data: response.data,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof AxiosError) {
      throw new HttpError(
        error?.response?.data?.message ?? "Something went wrong!",
        error?.response?.status ?? 500
      );
    }

    throw error;
  }
};

const contactLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  lead_type: z.coerce.number().min(1, { message: "Lead type is required." }),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian number starting with 6-9",
  }),
});

const contactLead = async (req, res) => {
  try {
    const validateData = contactLeadSchema.parse(req.body);

    let data = JSON.stringify({
      firstName: validateData.firstName,
      lastName: validateData.lastName,
      phoneNumbers: [
        {
          type: "MOBILE",
          code: "IN",
          primary: true,
          value: validateData.phoneNumber,
        },
      ],
      customFieldValues: {
        cfLeadType: validateData.lead_type,
      },
      source: 2561913,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.kylas.io/v1/leads/",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.KYLAS_API_KEY,
      },
      data: data,
    };

    const response = await axios.request(config);
    return res.send({
      status: true,
      message: "Contact Lead created",
      data: response.data,
    });
  } catch (error) {
    // throw error;
    console.log(error);
    if (error instanceof AxiosError) {
      throw new HttpError(
        error?.response?.data?.message ?? "Something went wrong!",
        error?.response?.status ?? 500
      );
    } else {
      throw error;
    }
  }
};

export default {
  create: create,
  dowbloadBrochure: dowbloadBrochure,
  createEnquiryLead: createEnquiryLead,
  contactLead: contactLead,
};
