import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const technicianSchema = z
  .object({
    technician_name: z.string().min(1, { message: "Model name is required." }),
    technician_phone: z
      .string()
      .min(1, { message: "Model phone is required." }),
  })
  .refine((data) => isValidPhoneNumber(data.technician_phone), {
    path: ["technician_phone"],
    message: "Invalid phone number",
  });
