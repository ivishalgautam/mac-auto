import { z } from "zod";

const featureItemSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  sub_heading: z.string().min(1, "Sub Heading is required"),
  image: z.any().refine((file) => {
    return file === null || file instanceof File || typeof file === "string";
  }, "Image is required"),
});

const pricingItemSchema = z.object({
  name: z
    .string({ required_error: "State name is required*" })
    .min(1, { message: "State name is required*" }),
  base_price: z
    .number({ required_error: "Base price is required*" })
    .min(1, { required_error: "Base price is required*" }),
  cities: z.array(
    z.object({
      name: z
        .string({ required_error: "City name is required*" })
        .min(1, { message: "City name is required*" }),
      price_modifier: z
        .number({ required_error: "Price modifier is required*" })
        .min(1, { required_error: "Price modifier is required*" }),
    }),
  ),
});

const emiCalculatorSchema = z.object({
  default_values: z.object({
    down_payment: z.number(),
    loan_tenure: z.number(),
    // interest_rate: z.number(),
  }),
  ranges: z.object({
    down_payment: z.object({
      min: z.number(),
      step: z.number(),
    }),
    loan_tenure: z.object({
      min: z.number(),
      max: z.number(),
      step: z.number(),
    }),
    // interest_rate: z.object({
    //   min: z.number(),
    //   max: z.number(),
    //   step: z.number(),
    // }),
  }),
});

const specificationSchema = z.object({
  tab_name: z
    .string({ required_error: "Tab name is required*" })
    .min(1, { message: "Tab name is required*" }),
  specs: z.array(
    z.object({
      label: z
        .string({ required_error: "Label is required*" })
        .min(1, { message: "Label is required*" }),
      value: z
        .string({ required_error: "Value is required*" })
        .min(1, { message: "Value is required*" }),
    }),
  ),
});

export const vehicleSchema = z.object({
  // carousel: z
  //   .array(ImageSchema)
  //   .min(1, { message: "Atleast 1 carousel is required*" }),
  category: z.enum(["passenger", "cargo", "garbage"], {
    required_error: "Category is required!",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  vehicle_id: z.string().uuid().nullable().optional(),
  is_variant: z.boolean().default(false),
  color: z
    .string({ required_error: "Color is required!" })
    .min(1, { message: "Color is required!" }),
  quantity: z.number().default(0),
  features: z.array(featureItemSchema).optional(),
  pricing: z.array(pricingItemSchema).nonempty(),
  chassis_numbers: z.array(
    z.object({
      number: z
        .string({ required_error: "required*" })
        .min(1, { message: "required*" }),
    }),
  ),
  specifications: z.array(specificationSchema).nonempty(),
  emi_calculator: emiCalculatorSchema,
  // financing_companies: z.array(
  //   z.object({
  //     id: z.string(),
  //     name: z.string(),
  //     interest_rate: z.number(),
  //     color: z.string(),
  //   }),
  // ),
});

export const vehicleUpdateSchema = z.object({
  // carousel: z
  //   .array(ImageSchema)
  //   .min(1, { message: "Atleast 1 carousel is required*" }),
  category: z.enum(["passenger", "cargo", "garbage"], {
    required_error: "Category is required!",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  vehicle_id: z.string().uuid().nullable().optional(),
  is_variant: z.boolean().default(false),
  color: z
    .string({ required_error: "Color is required!" })
    .min(1, { message: "Color is required!" }),
  quantity: z.number().default(0),
  features: z.array(featureItemSchema).optional(),
  pricing: z.array(pricingItemSchema).nonempty(),
  emi_calculator: emiCalculatorSchema,
  specifications: z.array(specificationSchema).nonempty(),

  // financing_companies: z.array(
  //   z.object({
  //     id: z.string(),
  //     name: z.string(),
  //     interest_rate: z.number(),
  //     color: z.string(),
  //   }),
  // ),
});

// Zod schema for Inventory
export const inventorySchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .min(0, { message: "Quantity is required" }),
  chassis_numbers: z.array(
    z.object({
      number: z
        .string({ required_error: "required*" })
        .min(1, { message: "required*" }),
    }),
  ),
});

export const featuresStepsSchema = z.object({
  header: z.object({
    title: z
      .string()
      .min(1, "Header title is required")
      .max(100, "Header title must be less than 100 characters"),
    subtitle: z
      .string()
      .min(1, "Header subtitle is required")
      .max(150, "Header subtitle must be less than 150 characters"),
    description: z
      .string()
      .min(1, "Header description is required")
      .max(500, "Header description must be less than 500 characters"),
  }),
  steps: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Step title is required")
          .max(100, "Step title must be less than 100 characters"),
        text: z
          .string()
          .min(1, "Step text is required")
          .max(500, "Step text must be less than 500 characters"),
        image: z
          .string()
          .optional()
          .or(z.literal(""))
          .refine(
            (val) => !val || val.startsWith("/") || val.startsWith("http"),
            {
              message: "Image must be a valid path or URL",
            },
          ),
        features: z
          .array(
            z.object({
              strong: z
                .string()
                .min(1, "Feature title is required")
                .max(50, "Feature title must be less than 50 characters"),
              description: z
                .string()
                .min(1, "Feature description is required")
                .max(
                  200,
                  "Feature description must be less than 200 characters",
                ),
            }),
          )
          .min(1, "At least one feature group is required"),
      }),
    )
    .min(1, "At least one step is required")
    .max(10, "Maximum 10 steps allowed"),
});
