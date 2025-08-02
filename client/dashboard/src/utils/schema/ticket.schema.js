import { z } from "zod";

export const ticketSchema = z.object({
  customer_id: z
    .string({ required_error: "Customer ID is required*" })
    .uuid()
    .min(1, { message: "Customer ID is required*" }),
  purchase_id: z
    .string({ required_error: "Purchase ID is required*" })
    .uuid()
    .min(1, { message: "Purchase ID is required*" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
});

export const customerTicketSchema = z.object({
  purchase_id: z
    .string({ required_error: "Customer ID is required*" })
    .uuid()
    .min(1, { message: "Customer ID is required*" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
});
