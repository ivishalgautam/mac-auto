import { z } from "zod";

export const customerInventorySchema = z.object({
  vehicle_id: z.string().uuid("Vehicle is required"),
  customer_id: z.string().uuid("Customer is required"),
  chassis_no: z.string().min(1, "Chassis number is required"),
  motor_no: z.string().min(1, "Motor number is required"),
  battery_no: z.string().min(1, "Battery number is required"),
  controller_no: z.string().min(1, "Controller number is required"),
  charger_no: z.string().min(1, "Charger number is required"),
});
