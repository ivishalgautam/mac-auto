import { z } from "zod";

export const ticketSchema = z.object({
  purchase_id: z
    .string({ required_error: "Purchase ID is required*" })
    .uuid()
    .min(1, { message: "Purchase ID is required*" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  images: z
    .array(z.string({ required_error: "Images is required*" }))
    .min(1, { message: "Images is required*" }),
});
