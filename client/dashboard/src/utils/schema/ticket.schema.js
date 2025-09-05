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
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce.date().nullable(),
  assigned_technician: z.string().optional().nullable(),
  assigned_manager: z.string().optional().nullable(),
  parts: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional()
    .default([]),
});

export const customerTicketSchema = z.object({
  purchase_id: z
    .string({ required_error: "Customer ID is required*" })
    .uuid()
    .min(1, { message: "Customer ID is required*" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  parts: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional()
    .default([]),
});

export const dealerTicketSchema = z.object({
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce.date().nullable(),
  assigned_manager: z.string().optional().nullable(),
});
