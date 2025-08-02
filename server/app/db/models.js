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
import pdiCheckModel from "./models/pdi-check.model.js";
import vehicleEnquiryModel from "./models/vehicle-enquiry.model.js";
import customerModel from "./models/customer.model.js";
import customerDealersModel from "./models/customer-dealers.model.js";
import followupModel from "./models/followup.model.js";
import schemeModel from "./models/scheme.model.js";
import customerPurchaseModel from "./models/customer-purchase.model.js";
import ticketModel from "./models/ticket.model.js";

export default {
  UserModel: userModel,
  OTPModel: otpModel,
  VehicleModel: vehicleModel,
  InventoryModel: inventoryModel,
  QueryModel: queryModel,
  EnquiryModel: enquiryModel,
  DealerModel: dealerModel,
  DealerInventoryModel: dealerInventoryModel,
  FinancerModel: financerModel,
  DealerOrderModel: dealerOrderModel,
  PDICheckModel: pdiCheckModel,
  VehicleEnquiryModel: vehicleEnquiryModel,
  CustomerModel: customerModel,
  CustomerDealersModel: customerDealersModel,
  FollowupModel: followupModel,
  SchemeModel: schemeModel,
  CustomerPurchaseModel: customerPurchaseModel,
  TicketModel: ticketModel,
};
