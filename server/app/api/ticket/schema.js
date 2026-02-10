import { z } from "zod";

export const ticketSchema = z
  .object({
    customer_id: z.string().uuid().optional().nullable(),
    assigned_cre: z.string().uuid().optional().nullable(),
    message: z
      .string({ required_error: "Message is required*" })
      .min(1, { message: "Message is required*" }),
    mac_message: z.string().optional().nullable(),
    images: z.array(z.string()).optional().default([]),
    complaint_type: z
      .string()
      .min(1, { message: "Complaint type is required" }),
    expected_closure_date: z.coerce
      .date()
      .optional()
      .nullable()
      .transform((date) => (date ? date.toISOString().split("T")[0] : null)),
    assigned_technician: z.string().optional().nullable(),
    // parts: z
    //   .array(z.object({ id: z.string(), text: z.string() }))
    //   .optional()
    //   .default([]),
    part_ids: z.array(z.string().uuid()).optional().default([]),
    warranty_detail: z.string().min(1, { message: "Select warranty." }),
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
