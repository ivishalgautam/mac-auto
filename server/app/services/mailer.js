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
async function sendSimpleEmail() {
  try {
    const mailOptions = {
      from: '"Bharat Shakti Tenders" <no-reply@bharatshaktitenders.com>',
      to: "recipient@example.com",
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

// Function to send email with attachments
async function sendEmailWithAttachment() {
  try {
    const mailOptions = {
      from: '"Your App Name" <your-email@domain.com>',
      to: "recipient@example.com",
      subject: "Email with Attachment",
      html: `
        <h2>Hello!</h2>
        <p>This email contains an attachment.</p>
        <p>Best regards,<br>Your Team</p>
      `,
      attachments: [
        {
          filename: "document.pdf",
          path: "./files/document.pdf", // file path
        },
        {
          filename: "image.png",
          content: Buffer.from("base64-encoded-content", "base64"),
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email with attachment sent successfully!");
    return info;
  } catch (error) {
    console.error("Error sending email with attachment:", error);
    // throw error;
  }
}

// Function to send bulk emails
async function sendBulkEmails(recipients) {
  const promises = recipients.map(async (recipient) => {
    const mailOptions = {
      from: '"Your App Name" <your-email@domain.com>',
      to: recipient.email,
      subject: `Hello ${recipient.name}!`,
      html: `
        <h2>Hi ${recipient.name}!</h2>
        <p>This is a personalized email sent to you.</p>
        <p>Thank you for being our valued customer!</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${recipient.email}`);
      return {
        success: true,
        email: recipient.email,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        `Failed to send email to ${recipient.email}:`,
        error.message
      );
      return { success: false, email: recipient.email, error: error.message };
    }
  });

  return await Promise.allSettled(promises);
}

export const Brevo = {
  transporter: transporter,
  sendSimpleEmail: sendSimpleEmail,
  sendEmailWithAttachment: sendEmailWithAttachment,
  sendBulkEmails: sendBulkEmails,
};
