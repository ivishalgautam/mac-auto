import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import ejs from "ejs";
import config from "../config/index.js";

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: config.smtp_port,
  secure: true,
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

export const mailer = {
  transporter: transporter,
  sendSimpleEmail: sendSimpleEmail,
  sendResetPasswordEmail: sendResetPasswordEmail,
};
