import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import config from "../config/index.js";

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: config.smtp_port,
  secure: false,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_password,
  },
});

// Function to send a simple email
async function sendSimpleEmail(email) {
  try {
    const mailOptions = {
      from: config.smtp_from_email,
      to: email,
      subject: "Hello from Brevo + Nodemailer",
      text: "This is a plain text email sent via Brevo SMTP!",
      html: "<p>This is an <b>HTML email</b> sent via Brevo SMTP!</p>",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // throw error;
  }
}

async function sendResetPasswordEmail(userEmail, token, role) {
  try {
    const templatePath = path.join(
      process.cwd(),
      "views",
      "forgot-password.ejs"
    );
    const templateString = fs.readFileSync(templatePath, "utf-8");
    const resetLink = `${role === "dealer" ? config.dealerDashboardLink : role === "customer" ? config.customerDashboardLink : config.adminDashboardLink}/reset-password?t=${token}`;
    const htmlContent = ejs.render(templateString, {
      resetLink,
    });

    const mailOptions = {
      from: config.smtp_from_email,
      to: userEmail,
      subject: "Reset Your Password – Mac Auto India",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully!");
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export const sendOrderStatusUpdateEmail = async ({
  email,
  fullname,
  order_code,
  status,
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "views",
      "order-status-update.ejs"
    );
    const templateContent = fs.readFileSync(templatePath, "utf-8");

    const html = ejs.render(templateContent, {
      fullname,
      order_code,
      status,
    });
    const mailOptions = {
      from: config.smtp_from_email,
      to: email,
      subject: "Your Order Status Has Been Updated",
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order status change mail sent successfully!");
    return info;
  } catch (error) {
    console.error("Error sending order status change email:", error);
  }
};

export const sendOrderCreatedEmail = async ({
  email,
  fullname,
  order_code,
  status,
}) => {
  try {
    const templatePath = path.join(process.cwd(), "views", "order-create.ejs");
    const templateContent = fs.readFileSync(templatePath, "utf-8");

    const html = ejs.render(templateContent, {
      fullname,
      order_code,
      status,
    });
    const mailOptions = {
      from: config.smtp_from_email,
      to: email,
      subject: "Your Order Created successfully.",
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Order create mail sent successfully!");
    return info;
  } catch (error) {
    console.error("Error sending order create email:", error);
  }
};

export const mailer = {
  transporter: transporter,
  sendSimpleEmail: sendSimpleEmail,
  sendResetPasswordEmail: sendResetPasswordEmail,
  sendOrderStatusUpdateEmail: sendOrderStatusUpdateEmail,
  sendOrderCreatedEmail: sendOrderCreatedEmail,
};
