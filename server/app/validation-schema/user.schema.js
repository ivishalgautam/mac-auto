import { z } from "zod";

export const userSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50),
    password: z.string(),
    first_name: z
      .string({ required_error: "First Name is required!" })
      .min(1, { message: "First Name is required!" }),
    last_name: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    mobile_number: z.string(),
    role: z
      .enum(["admin", "customer", "dealer", "cre", "manager"])
      .default("user"),
    location: z.string().optional(),
    // mobile_number: z.string().min(10, "Please enter a valid mobile number"),
    // password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (
      data.role === "dealer" &&
      (!data.location || data.location.trim() === "")
    ) {
      ctx.addIssue({
        path: ["location"],
        code: z.ZodIssueCode.custom,
        message: "Location is required for dealers",
      });
    }
  });

export const registerVerifySchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50),
    password: z.string(),
    first_name: z
      .string({ required_error: "First Name is required!" })
      .min(1, { message: "First Name is required!" }),
    last_name: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    mobile_number: z.string(),
    role: z
      .enum(["admin", "customer", "dealer", "cre", "manager"])
      .default("user"),
    location: z.string().optional(),

    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits"),
    request_id: z.string().uuid(),
  })
  .superRefine((data, ctx) => {
    if (
      data.role === "dealer" &&
      (!data.location || data.location.trim() === "")
    ) {
      ctx.addIssue({
        path: ["location"],
        code: z.ZodIssueCode.custom,
        message: "Location is required for dealers",
      });
    }
  });
