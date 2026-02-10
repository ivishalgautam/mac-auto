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
    "Username can only contain letters, numbers, and underscores"
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
      "Dealer code can only contain letters, numbers, and underscores"
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

export const userSchema = z
  .object({
    ...baseFields,
    username: z.string().optional().nullable(),
    dealer_code: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    confirm_password: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
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

    // Apply staff (role !== customer)
    if (data.role !== "customer") {
      const parsed = staffFields.safeParse(data);
      if (!parsed.success) parsed.error.issues.forEach((i) => ctx.addIssue(i));
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
      .min(4, { message: "First Name is required!" }),
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
