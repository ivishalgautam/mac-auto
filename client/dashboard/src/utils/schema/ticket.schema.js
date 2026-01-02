import { z } from "zod";

const baseTicketSchema = z.object({
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),

  complaint_type: z.string().min(1, { message: "Complaint type is required" }),

  parts: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional()
    .default([]),
});

export const customerTicketSchema = baseTicketSchema.extend({
  // purchase_id: z
  //   .string({ required_error: "Purchase ID is required*" })
  //   .uuid()
  //   .min(1, { message: "Purchase ID is required*" }),
});

export const creTicketSchema = baseTicketSchema.extend({
  customer_id: z
    .string({ required_error: "Customer ID is required*" })
    .uuid()
    .min(1, { message: "Customer ID is required*" }),

  expected_closure_date: z.coerce.date().nullable(),

  assigned_technician: z.string().optional().nullable(),
  assigned_manager: z.string().optional().nullable(),
});

export const ticketSchema = baseTicketSchema.extend({
  customer_id: z
    .string({ required_error: "Customer ID is required*" })
    .uuid()
    .min(1, { message: "Customer ID is required*" }),

  expected_closure_date: z.coerce.date().nullable(),

  assigned_technician: z.string().optional().nullable(),
  assigned_manager: z.string().optional().nullable(),
  assigned_cre: z
    .string()
    .uuid({ message: "Invalid CRE." })
    .min(1, { message: "Select CRE." }),
});

export const dealerTicketForAdminSchema = z.object({
  dealer_id: z.string().uuid({ message: "Please select valid dealer" }),
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce.date().nullable(),
  assigned_manager: z.string().optional().nullable(),
});

export const dealerTicketForDealerSchema = z.object({
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),
  complaint_type: z.string().min(1, { message: "Complaint type is required" }),
  expected_closure_date: z.coerce.date().nullable(),
  assigned_manager: z.string().optional().nullable(),
});
