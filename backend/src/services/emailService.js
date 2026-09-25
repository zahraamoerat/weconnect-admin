const nodemailer = require("nodemailer");
require("dotenv").config();

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@weconnect.local",
  };
}

function isSmtpConfigured() {
  const config = getSmtpConfig();
  return Boolean(config.host && config.user && config.pass);
}

async function sendSupplierDecisionEmail({ email, businessName, status }) {
  if (!email) {
    return { sent: false, reason: "MISSING_EMAIL" };
  }

  if (!isSmtpConfigured()) {
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const decisionText = status === "Approved" ? "accepted" : "declined";
  const subject =
    status === "Approved"
      ? "Your supplier request has been accepted"
      : "Your supplier request has been declined";

  const message =
    status === "Approved"
      ? `Dear ${businessName || "Supplier"},\n\nWe are pleased to inform you that your supplier request has been accepted. You can now log in and continue setting up your account on WeConnect.\n\nRegards,\nWeConnect Admin Team`
      : `Dear ${businessName || "Supplier"},\n\nWe regret to inform you that your supplier request has been declined. If you believe this was a mistake or would like to reapply, please contact the admin team for more information.\n\nRegards,\nWeConnect Admin Team`;

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: email,
      subject,
      text: message,
      html: `<p>Dear ${businessName || "Supplier"},</p><p>We are pleased to inform you that your supplier request has been ${decisionText}.</p><p>Regards,<br/>WeConnect Admin Team</p>`,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error("Send supplier decision email error:", error);
    return { sent: false, reason: "EMAIL_SEND_FAILED", error };
  }
}

module.exports = {
  sendSupplierDecisionEmail,
  isSmtpConfigured,
};
