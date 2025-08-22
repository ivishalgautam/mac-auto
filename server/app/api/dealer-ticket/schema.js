import { z } from "zod";

export const ticketSchema = z.object({
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce.date().optional().nullable(),
});
