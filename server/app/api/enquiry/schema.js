import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const createNewCustomerOrderSchema = z.object({
  dealer_id: z.string().uuid().or(z.literal("")).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile_number: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val), {
      message: "Invalid phone number",
    }),
  booking_amount: z.number().min(1, { message: "Booking amount is required." }),
});

export const createExistingCustomerOrderSchema = z.object({
  dealer_id: z.string().uuid().or(z.literal("")).optional(),
});

export const inquiryAssignToDealer = z.object({
  dealer_id: z.string().uuid(),
});
