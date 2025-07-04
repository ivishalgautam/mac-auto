import { z } from "zod";

export const faqSchema = z.object({
  faqs: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, "Question is required")
          .max(500, "Question cannot exceed 500 characters"),
        answer: z
          .string()
          .min(1, "Answer is required")
          .max(5000, "Answer cannot exceed 5000 characters"),
      })
    )
    .min(1, "At least one FAQ is required")
    .max(50, "Cannot have more than 50 FAQs"),
});
