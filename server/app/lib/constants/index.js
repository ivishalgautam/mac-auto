"use strict";

const constants = {
  environment: {
    LOCAL: "local",
    DEVELOPMENT: "development",
    TEST: "test",
    PRODUCTION: "production",
  },
  http: {
    status: {
      OK: 200,
      CREATED: 201,
      ACCEPTED: 202,
      NOCONTENT: 204,
      MULTI_STATUS: 207,
      REDIRECT: 301,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
      NOT_FOUND: 404,
    },
  },
  error: {
    validation: {},
    message: {
      // HTTP Status code messages
      201: "Created",
      400: "Bad Request.",
      301: "Redirect to other url",
      401: "Unauthorized.",
      403: "Forbidden.",
      404: "The specified resource was not found.",
      409: "Resource already exists",
      500: "Internal Server Error.",
      INVALID_LOGIN: "Invalid Login",
      EMAIL_MISSING: "Email Missing",
      PAYMENT_ACCOUNT_ID_MISSING: "Payment Account Id Missing",
      INVALID_PAYMENT_ACCOUNT_ID: "Invalid Payment Account Id provided",
    },
  },
  models: {
    USER_TABLE: "users",
    OTP_TABLE: "otps",
    VEHICLE_TABLE: "vehicles",
    INVENTORY_TABLE: "inventories",
    DEALER_INVENTORY_TABLE: "dealer_inventories",
    QUERY_TABLE: "queries",
    ENQUIRY_TABLE: "enquiries",
    WALKIN_ENQUIRY_TABLE: "walkin_enquiries",
    DEALER_TABLE: "dealers",
    DEALER_INVENTORY_HISTORY_TABLE: "dealer_inventory_histories",
    CHASSIS_TABLE: "chassis_numbers",
    FINANCER_TABLE: "financers",
    DEALER_ORDER_TABLE: "dealer_orders",
    PDI_CHECK_TABLE: "pdi_checks",
    VEHICLE_ENQUIRY_TABLE: "vehicle_enquiries",
    CUSTOMER_TABLE: "customers",
    CUSTOMER_DEALERS_TABLE: "customer_dealers",
    FOLLOW_UP_TABLE: "followups",
    SCHEME_TABLE: "schemes",
    CUSTOMER_ORDER_TABLE: "customer_orders",
    CUSTOMER_PURCHASE_TABLE: "customer_purchases",
    TICKET_TABLE: "tickets",
    VEHICLE_COLOR_TABLE: "vehicle_colors",
  },
  bcrypt: {
    SALT_ROUNDS: 10,
  },
  time: {
    // TOKEN_EXPIRES_IN: 1000 * 10, // 15 * 1 minute = 15 minutes
    TOKEN_EXPIRES_IN: 1000 * 60 * 15, // 15 * 1 minute = 15 minutes
    REFRESH_TOKEN_EXPIRES_IN: 1000 * 60 * 60 * 24 * 1, // 1 day
  },
  rateLimit: {
    max_rate_limit: 1000,
    time_window: "1 minute",
  },
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:4000",
    "https://dashboard.brandingwaale.com",
    "https://macautoindia.com",
    "https://www.macautoindia.com",
    "https://dashboard.macautoindia.com",
  ],
};

export default constants;
