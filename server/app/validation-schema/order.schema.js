import { z } from "zod";

export const orderSchema = z
  .object({
    status: z.string({
      required_error: "Status is required",
    }),
    driver_details: z
      .object({
        driver_name: z
          .string({
            required_error: "Driver name is required",
          })
          .min(2, "Driver name must be at least 2 characters long")
          .max(50, "Driver name must be less than 50 characters"),
        vehicle_number: z
          .string({
            required_error: "Vehicle number is required",
          })
          .regex(
            /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{3,4}$/i,
            "Enter a valid vehicle number (e.g., MH12AB1234)"
          ),
        phone: z
          .string({ required_error: "Phone is required." })
          .min(1, { message: "Phone is required." }),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "out for delivery") {
      const { driver_details } = data;

      // check if driver_details exist and fields are not empty
      if (
        !driver_details?.driver_name ||
        !driver_details?.vehicle_number ||
        !driver_details?.phone
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["driver_details"],
          message:
            "Driver details are required when status is 'out for delivery'.",
        });
      }
    }
  });
