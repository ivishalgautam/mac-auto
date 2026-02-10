import { z } from "zod";

const baseTicketSchema = z.object({
  message: z
    .string({ required_error: "Message is required*" })
    .min(1, { message: "Message is required*" }),

  mac_message: z.string().optional().nullable(),

  complaint_type: z.string().min(1, { message: "Complaint type is required" }),

  // parts: z
  //   .array(z.object({ id: z.string(), text: z.string() }))
  //   .optional()
  //   .default([]),

  part_ids: z
    .array(z.object({ label: z.string(), value: z.string().uuid() }))
    .optional()
    .default([])
    .transform((data) => data?.map((d) => d.value) ?? []),

  warranty_detail: z.string().min(1, { message: "Select warranty." }),
});

export const customerTicketSchema = baseTicketSchema
  .extend({})
  .superRefine((data, ctx) => {
    if (
      data.complaint_type === "Spare Parts Related" &&
      (!data.part_ids || data.part_ids.length === 0)
    ) {
      ctx.addIssue({
        path: ["part_ids"],
        code: z.ZodIssueCode.custom,
        message:
          "At least one part must be selected for Spare Parts Related complaints",
      });
    }
  });

export const creTicketSchema = baseTicketSchema
  .extend({
    customer_id: z
      .string({ required_error: "Customer ID is required*" })
      .uuid()
      .min(1, { message: "Customer ID is required*" }),

    expected_closure_date: z.coerce.date().nullable(),

    assigned_technician: z.string().optional().nullable(),
    assigned_manager: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.complaint_type === "Spare Parts Related" &&
      (!data.part_ids || data.part_ids.length === 0)
    ) {
      ctx.addIssue({
        path: ["part_ids"],
        code: z.ZodIssueCode.custom,
        message:
          "At least one part must be selected for Spare Parts Related complaints",
      });
    }
  });

export const ticketSchema = baseTicketSchema
  .extend({
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
  })
  .superRefine((data, ctx) => {
    if (
      data.complaint_type === "Spare Parts Related" &&
      (!data.part_ids || data.part_ids.length === 0)
    ) {
      ctx.addIssue({
        path: ["part_ids"],
        code: z.ZodIssueCode.custom,
        message:
          "At least one part must be selected for Spare Parts Related complaints",
      });
    }
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
