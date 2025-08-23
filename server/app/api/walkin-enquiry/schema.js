import { isValidPhoneNumber } from "libphonenumber-js";
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

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => isValidPhoneNumber(val), {
    message: "Invalid phone number",
  });

const referenceSchema = z.object({
  name: z
    .string()
    .min(2, "Reference name must be at least 2 characters")
    .max(50, "Reference name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Reference name can only contain letters and spaces"
    )
    .trim(),

  landmark: z
    .string()
    .min(2, "Reference landmark must be at least 2 characters")
    .max(100, "Reference landmark cannot exceed 100 characters")
    .trim(),
});

const personDetailsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .trim(),

  phone: phoneSchema,

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters")
    .trim(),
});

export const walkInEnquirySchema = z
  .object({
    vehicle_id: z.string().uuid({ message: "Invalid vehicle" }),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .trim(),

    phone: phoneSchema,

    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location cannot exceed 100 characters")
      .trim(),

    purchase_type: z.enum(["finance", "cash"], {
      message: "Purchase type is required",
    }),

    pan: z.array(z.any()).optional(),
    aadhaar: z.array(z.any()).optional(),
    electricity_bill: z.array(z.any()).optional(),
    rent_agreement: z.array(z.any()).optional(),
    guarantor_aadhaar: z.array(z.any()).optional(),

    house: z.enum(["owned", "rented", "parental"]).optional(),

    landmark: z
      .string()
      .max(100, "Landmark cannot exceed 100 characters")
      .trim()
      .optional()
      .nullable(),

    alt_phone: z.union([phoneSchema, z.undefined(), z.null()]),

    // ✅ Allow array or undefined
    references: z
      .union([z.array(referenceSchema), z.undefined(), z.null()])
      .optional(),

    permanent_address: z.string().optional().nullable(),
    present_address: z.string().optional().nullable(),

    guarantor: z
      .union([personDetailsSchema, z.undefined(), z.null()])
      .optional(),
    co_applicant: z
      .union([personDetailsSchema, z.undefined(), z.null()])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.purchase_type !== "finance") return;

    // --- Mandatory document checks ---
    if (!data.pan || data.pan.length === 0) {
      ctx.addIssue({
        path: ["pan"],
        code: z.ZodIssueCode.custom,
        message: "PAN is required*",
      });
    }

    if (!data.aadhaar || data.aadhaar.length === 0) {
      ctx.addIssue({
        path: ["aadhaar"],
        code: z.ZodIssueCode.custom,
        message: "Aadhaar is required*",
      });
    }

    if (!data.electricity_bill || data.electricity_bill.length === 0) {
      ctx.addIssue({
        path: ["electricity_bill"],
        code: z.ZodIssueCode.custom,
        message: "Electricity bill is required*",
      });
    }

    if (
      data.house === "rented" &&
      (!data.rent_agreement || data.rent_agreement.length === 0)
    ) {
      ctx.addIssue({
        path: ["rent_agreement"],
        code: z.ZodIssueCode.custom,
        message: "Rent agreement is required*",
      });
    }

    if (
      data.house &&
      (!data.guarantor_aadhaar || data.guarantor_aadhaar.length === 0)
    ) {
      ctx.addIssue({
        path: ["guarantor_aadhaar"],
        code: z.ZodIssueCode.custom,
        message: "Guarantor aadhaar is required*",
      });
    }

    // --- References (exactly 2 required) ---
    if (!data.references || data.references.length < 2) {
      ctx.addIssue({
        path: ["references"],
        code: z.ZodIssueCode.custom,
        message: "At least 2 references are required",
      });
    } else if (data.references.length > 2) {
      ctx.addIssue({
        path: ["references"],
        code: z.ZodIssueCode.custom,
        message: "Maximum 2 references are allowed",
      });
    }

    if (
      !data.landmark ||
      (typeof data.landmark === "string" && data.landmark.trim() === "")
    ) {
      ctx.addIssue({
        path: ["landmark"],
        code: z.ZodIssueCode.custom,
        message: "Alternate phone is required",
      });
    }

    // --- Alternate phone check ---
    if (
      !data.alt_phone ||
      (typeof data.alt_phone === "string" && data.alt_phone.trim() === "")
    ) {
      ctx.addIssue({
        path: ["alt_phone"],
        code: z.ZodIssueCode.custom,
        message: "Alternate phone is required",
      });
    }

    // --- House check ---
    if (!data.house) {
      ctx.addIssue({
        path: ["house"],
        code: z.ZodIssueCode.custom,
        message: "Select house: Rented, Owned or Parental",
      });
    }

    // --- Address and person checks depending on house ---
    if (data.house === "rented") {
      if (!data.permanent_address) {
        ctx.addIssue({
          path: ["permanent_address"],
          code: z.ZodIssueCode.custom,
          message: "Permanent address is required",
        });
      }

      if (!data.present_address) {
        ctx.addIssue({
          path: ["present_address"],
          code: z.ZodIssueCode.custom,
          message: "Present address is required",
        });
      }

      if (!data.guarantor) {
        ctx.addIssue({
          path: ["guarantor"],
          code: z.ZodIssueCode.custom,
          message: "Guarantor details are required",
        });
      }
    }

    if (["owned", "parental"].includes(data.house)) {
      if (!data.co_applicant) {
        ctx.addIssue({
          path: ["co_applicant"],
          code: z.ZodIssueCode.custom,
          message: "Co-applicant details are required",
        });
      }
    }
  });
