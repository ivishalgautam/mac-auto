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
  cfDoYouHaveShowroomSpace: z.enum(["Yes", "No"], {
    message: "Do You Have Showroom Space is required, select 'Yes' OR 'No'",
  }),
  cfInvestmentCapacity: z.string().min(1),
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
        cfDoYouHaveShowroomSpace: validateData.cfDoYouHaveShowroomSpace,
        cfInvestmentCapacity: validateData.cfInvestmentCapacity,
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

export default {
  create: create,
};
