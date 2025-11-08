// schemas/orderSchema.js
import { z } from "zod";

export const addressSchema = z.object({
  fullname: z.string().min(1, "Fullname is required"),
  house: z.string().min(1, "House no. is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  phone: z.string().min(6).optional(),
});

const orderItemSchema = z.object({
  vehicle_id: z.string().uuid({ message: "Invalid vehicle_id" }),
  battery_type: z
    .string()
    .min(1, { message: "Battery type is required" })
    .max(100, { message: "Battery type too long" }),
  colors: z
    .array(
      z.object({
        color: z.string().min(1, { message: "Color is required" }),
        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .int()
          .positive({ message: "Quantity must be greater than 0" }),
      })
    )
    .min(1, { message: "At least one color is required" }),
});

export const createOrderSchema = z.object({
  dealer_id: z.string().uuid({ message: "Invalid dealer_id" }).optional(),
  order_items: z
    .array(orderItemSchema)
    .min(1, { message: "At least one order item is required" }),
});
