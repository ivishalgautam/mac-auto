import { z } from "zod";

export const assignCustomerToDealer = z.object({
  dealer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid({ message: "Select Dealer" })
    .min(1, { message: "Dealer ID is required" }),
  customer_id: z
    .string({ required_error: "Customer ID is required" })
    .uuid()
    .min(1, { message: "Customer ID is required" }),
});
