import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import config from "../config/index.js";

// =========================
// Create SMTP Transporter
// =========================
const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  secure: Number(config.smtp_port) === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_password,
  },
  logger: true,
  debug: true,
});

// =========================
// Verify SMTP Connection
// =========================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verification Failed");
    console.error(error);
  } else {
    console.log("✅ SMTP Server is ready.");
  }
});

// =========================
// Common Email Sender
// =========================
async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: config.smtp_from_email,
      to,
      subject,
      html,
      text,
    });

    console.log(`✅ Email sent to ${to}`);
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      info,
    };
  } catch (error) {
    console.error("======================================");
    console.error("Email Sending Failed");
    console.error("Code:", error.code);
    console.error("Response Code:", error.responseCode);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error(error);
    console.error("======================================");

    let message = "Failed to send email.";

    switch (error.code) {
      case "EAUTH":
        message = "SMTP authentication failed.";
        break;

      case "ECONNECTION":
        message = "Unable to connect to SMTP server.";
        break;

      case "ETIMEDOUT":
        message = "SMTP connection timed out.";
        break;

      case "ESOCKET":
        message = "SMTP socket error.";
        break;

      default:
        message = error.message;
    }

    throw new Error(message);
  }
}

// =========================
// Load EJS Template
// =========================
function renderTemplate(templateName, data = {}) {
  const templatePath = path.join(process.cwd(), "views", `${templateName}.ejs`);

  const template = fs.readFileSync(templatePath, "utf8");

  return ejs.render(template, data);
}

// =========================
// Simple Email
// =========================
async function sendSimpleEmail(email) {
  return sendEmail({
    to: email,
    subject: "Hello from Brevo + Nodemailer",
    text: "This is a plain text email sent via Brevo SMTP!",
    html: "<p>This is an <b>HTML email</b> sent via Brevo SMTP!</p>",
  });
}

// =========================
// Reset Password
// =========================
async function sendResetPasswordEmail(userEmail, token, role) {
  const resetLink = `${
    role === "dealer"
      ? config.dealerDashboardLink
      : role === "customer"
        ? config.customerDashboardLink
        : config.adminDashboardLink
  }/reset-password?t=${token}`;

  const html = renderTemplate("forgot-password", {
    resetLink,
  });

  return sendEmail({
    to: userEmail,
    subject: "Reset Your Password – Mac Auto India",
    html,
  });
}

// =========================
// Order Status Update
// =========================
async function sendOrderStatusUpdateEmail({
  email,
  fullname,
  order_code,
  status,
}) {
  const html = renderTemplate("order-status-update", {
    fullname,
    order_code,
    status,
  });

  return sendEmail({
    to: email,
    subject: "Your Order Status Has Been Updated",
    html,
  });
}

// =========================
// Order Created
// =========================
async function sendOrderCreatedEmail({ email, fullname, order_code, status }) {
  const html = renderTemplate("order-create", {
    fullname,
    order_code,
    status,
  });

  return sendEmail({
    to: email,
    subject: "Your Order Created Successfully",
    html,
  });
}

// =========================
// Customer Credentials
// =========================
async function sendCustomerCredentialsEmail({
  email,
  fullname,
  username,
  password,
}) {
  const html = renderTemplate("customer-credentials", {
    fullname,
    username,
    password,
  });

  return sendEmail({
    to: email,
    subject: "Welcome to Mack EV – Your Login Credentials",
    html,
  });
}

// =========================
// Export
// =========================
export const mailer = {
  transporter,
  sendSimpleEmail,
  sendResetPasswordEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCreatedEmail,
  sendCustomerCredentialsEmail,
};
