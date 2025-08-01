import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

export const vehicleInquirySchema = z
  .object({
    vehicle_id: z.string().min(1, "Vehicle ID is required").trim(),

    quantity: z
      .number({
        required_error: "Quantity is required",
        invalid_type_error: "Quantity must be a number",
      })
      .min(1, "Quantity must be at least 1")
      .max(100, "Quantity cannot exceed 100")
      .int("Quantity must be a whole number"),

    message: z
      .string()
      .max(1000, "Message cannot exceed 1000 characters")
      .optional()
      .or(z.literal("")),

    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .trim(),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(100, "Email cannot exceed 100 characters")
      .trim()
      .toLowerCase(),

    phone: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),

    location: z
      .string()
      .min(1, "Location is required")
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location cannot exceed 100 characters")
      .trim(),
  })
  .refine((data) => isValidPhoneNumber(data.phone), {
    path: ["phone"],
    message: "Invalid phone number",
  });

// Optional: Create a type from the schema for TypeScript
