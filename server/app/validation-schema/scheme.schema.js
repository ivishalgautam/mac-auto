import moment from "moment";
import { z } from "zod";

export const schemeSchema = z.object({
  message: z.string().min(1, { message: "Message is required." }),
  date: z.coerce.date().default(moment().format("YYYY-MM-DD")),
  is_active: z.boolean().default(false),
});
