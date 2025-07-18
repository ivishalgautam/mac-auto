"use strict";
import otpModel from "./models/otp.model.js";
import userModel from "./models/user.model.js";
import vehicleModel from "./models/vehicle.model.js";
import queryModel from "./models/query.model.js";
import enquiryModel from "./models/enquiry.model.js";
import dealerModel from "./models/dealer.model.js";
import dealerInventoryModel from "./models/dealer-inventory.model.js";
import inventoryModel from "./models/inventory.model.js";
import financerModel from "./models/financer.model.js";
import dealerOrderModel from "./models/dealer-order.model.js";

export default {
  UserModel: userModel,
  OTPModel: otpModel,
  VehicleModel: vehicleModel,
  InventoryModel: inventoryModel,
  QueryModel: queryModel,
  EnquiryModel: enquiryModel,
  DealerModel: dealerModel,
  DealerInventoryModel: dealerInventoryModel,
  // DealerInventoryHistoryModel: dealerInventoryHistoryModel,
  FinancerModel: financerModel,
  DealerOrderModel: dealerOrderModel,
};
