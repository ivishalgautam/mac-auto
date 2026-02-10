import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// ---------- SHARED RULES ----------
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;

const usernameField = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be less than 50 characters")
  .regex(
    USERNAME_REGEX,
    "Username can only contain letters, numbers, and underscores",
  );

const passwordField = z
  .string()
  .min(3, "Password must be at least 3 characters")
  .max(50, "Password must be less than 50 characters")
  .regex(PASSWORD_REGEX, "Password can only contain letters and numbers");

const dealerFields = z.object({
  dealer_code: z
    .string()
    .min(1, "Dealer code is required for dealers")
    .regex(
      USERNAME_REGEX,
      "Dealer code can only contain letters, numbers, and underscores",
    ),

  location: z.string().min(1, "Location is required for dealers"),
});

const staffFields = z
  .object({
    username: usernameField,
    password: passwordField.optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ---------- BASE USER FIELDS ----------
const baseFields = {
  role: z.enum(["admin", "dealer", "customer", "cre", "manager"], {
    required_error: "Role is required.",
  }),
  email: z.string().email("Please enter a valid email address"),
  mobile_number: z
    .string({ required_error: "Mobile number is required." })
    .min(1, "Mobile number is required"),
  first_name: z
    .string({ required_error: "First Name is required!" })
    .min(4, "First Name must be atleast 4 characters!"),
  last_name: z.string().optional(),
};

// ---------- CREATE (userFormSchema) ----------

export const userFormSchema = z
  .object({
    ...baseFields,
    username: z.string().optional(),
    dealer_code: z.string().optional(),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
    location: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate mobile number
    if (!isValidPhoneNumber(data.mobile_number)) {
      ctx.addIssue({
        path: ["mobile_number"],
        message: "Invalid phone number",
      });
    }

    // Dealer rules
    if (data.role === "dealer") {
      const parsed = dealerFields.safeParse(data);
      if (!parsed.success) parsed.error.issues.forEach((i) => ctx.addIssue(i));
    }
    if (data.role === "dealer" && !data.state?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dealer state is required",
        path: ["state"],
      });
    }
    if (data.role === "dealer" && !data.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dealer city is required",
        path: ["city"],
      });
    }

    // Apply staff (role !== customer)
    if (data.role !== "customer") {
      const parsed = staffFields.safeParse(data);
      if (!parsed.success) parsed.error.issues.forEach((i) => ctx.addIssue(i));
    }
    if (data.role === "customer" && !data.state?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer state is required",
        path: ["state"],
      });
    }
    if (data.role === "customer" && !data.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer city is required",
        path: ["city"],
      });
    }
    if (data.role === "customer" && !data.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer address is required",
        path: ["address"],
      });
    }
  });

// ---------- UPDATE (userUpdateSchema) ----------
// Update doesn't require password unless user wants to change it.

export const userUpdateSchema = z
  .object({
    ...baseFields,
    username: usernameField,
    dealer_code: z.string().optional(),
    location: z.string().optional(),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate mobile number
    if (!isValidPhoneNumber(data.mobile_number)) {
      ctx.addIssue({
        path: ["mobile_number"],
        message: "Invalid phone number",
      });
    }

    // Dealer rules
    if (data.role === "dealer") {
      const parsed = dealerFields.safeParse(data);
      if (!parsed.success) parsed.error.issues.forEach((i) => ctx.addIssue(i));
    }
    if (data.role === "dealer" && !data.state?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dealer state is required",
        path: ["state"],
      });
    }
    if (data.role === "dealer" && !data.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dealer city is required",
        path: ["city"],
      });
    }

    // customer rules
    if (data.role === "customer" && !data.state?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer state is required",
        path: ["state"],
      });
    }
    if (data.role === "customer" && !data.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer city is required",
        path: ["city"],
      });
    }
    if (data.role === "customer" && !data.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer address is required",
        path: ["address"],
      });
    }

    // If password provided in update, enforce validation
    if (data.password) {
      const parsed = passwordField.safeParse(data.password);
      if (!parsed.success) {
        parsed.error.issues.forEach((i) =>
          ctx.addIssue({ ...i, path: ["password"] }),
        );
      }

      if (data.password !== data.confirm_password) {
        ctx.addIssue({
          path: ["confirm_password"],
          message: "Passwords do not match",
        });
      }
    }
  });

export const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
