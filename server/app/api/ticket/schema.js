import { z } from "zod";

export const ticketSchema = z.object({
  purchase_id: z
    .string({ required_error: "Purchase ID is required*" })
    .uuid()
    .min(1, { message: "Purchase ID is required*" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  images: z.array(z.string()).optional().default([]),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce
    .date()
    .optional()
    .nullable()
    .transform((date) => (date ? date.toISOString().split("T")[0] : null)),
  assigned_technician: z.string().optional().nullable(),
  parts: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional()
    .default([]),
});
