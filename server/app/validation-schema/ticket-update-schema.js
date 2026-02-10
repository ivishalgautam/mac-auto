import { z } from "zod";

export const ticketUpdateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  ticket_id: z
    .string({ required_error: "required*" })
    .uuid()
    .optional()
    .nullable(),
  dealer_ticket_id: z
    .string({ required_error: "required*" })
    .uuid()
    .optional()
    .nullable(),
});
