"use strict";
import "dotenv/config";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || 3001;

const config = {
  port: parseInt(process.env.PORT, 10),
  // postgres creds
  PG_DATABASE_NAME: process.env.PG_DATABASE_NAME,
  PG_USERNAME: process.env.PG_USERNAME,
  PG_PASSWORD: process.env.PG_PASSWORD,
  pg_host: process.env.PG_HOST,
  pg_dialect: process.env.DB_DIALECT,

  allowed_origins: process.env.ALLOWED_ORIGINS?.split(",") ?? [],

  // jwt secret key
  jwt_secret: process.env.JWT_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,

  // smtp
  smtp_from_email: process.env.BREVO_EMAIL,
  smtp_port: parseInt(process.env.SMTP_PORT) || 465,
  smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,

  // dashboard client links
  adminDashboardLink: process.env.ADMIN_DASHBOARD,
  dealerDashboardLink: process.env.DEALER_DASHBOARD,
  customerDashboardLink: process.env.CUSTOMER_DASHBOARD,
};

export default config;
