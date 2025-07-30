import { z } from "zod";

export const convertToCustomerSchema = z.object({
  dealer_id: z.string().uuid().or(z.literal("")).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const inquiryAssignToDealer = z.object({
  dealer_id: z.string().uuid(),
});
