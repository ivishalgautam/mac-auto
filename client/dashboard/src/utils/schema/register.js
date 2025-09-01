import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const userFormSchema = z
  .object({
    role: z.enum(["admin", "dealer", "customer", "cre", "manager"], {
      required_error: "Role is required.",
    }),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    dealer_code: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    mobile_number: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),
    first_name: z
      .string({ required_error: "First Name is required!" })
      .min(1, { message: "First Name is required!" }),
    last_name: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
    location: z.string().optional(),
  })
  .refine((data) => isValidPhoneNumber(data.mobile_number), {
    path: ["mobile_number"],
    message: "Invalid phone number",
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  })
  .superRefine((data, ctx) => {
    if (data.role === "dealer") {
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

      if (!data.dealer_code || data.dealer_code.trim() === "") {
        ctx.addIssue({
          path: ["dealer_code"],
          code: z.ZodIssueCode.custom,
          message: "Dealer code is required for dealers",
        });
      } else {
        // Dealer code regex validation
        if (!/^[a-zA-Z0-9_]+$/.test(data.dealer_code)) {
          ctx.addIssue({
            path: ["dealer_code"],
            code: z.ZodIssueCode.custom,
            message:
              "Dealer code can only contain letters, numbers, and underscores",
          });
        }
      }
    }
  });

export const userUpdateSchema = z
  .object({
    role: z.enum(["admin", "dealer", "customer", "cre", "manager"], {
      required_error: "Role is required.",
    }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(50, { message: "Username must be at most 50 characters long" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    dealer_code: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    mobile_number: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),
    first_name: z
      .string({ required_error: "First Name is required!" })
      .min(1, { message: "First Name is required!" }),
    last_name: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => isValidPhoneNumber(data.mobile_number), {
    path: ["mobile_number"],
    message: "Invalid phone number",
  })
  .superRefine((data, ctx) => {
    console.log({ data });
    if (data.role === "dealer") {
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
      if (!data.dealer_code || data.dealer_code.trim() === "") {
        ctx.addIssue({
          path: ["dealer_code"],
          code: z.ZodIssueCode.custom,
          message: "Dealer code is required for dealers",
        });
      } else {
        // Dealer code regex validation
        if (!/^[a-zA-Z0-9_]+$/.test(data.dealer_code)) {
          ctx.addIssue({
            path: ["dealer_code"],
            code: z.ZodIssueCode.custom,
            message:
              "Dealer code can only contain letters, numbers, and underscores",
          });
        }
      }
    }
  });

export const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
