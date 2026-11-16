"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT = 20000;
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function getBrevoConfig() {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.MAIL_FROM_EMAIL;
    const fromName = process.env.MAIL_FROM_NAME || "Kukin";
    if (!apiKey || !fromEmail) {
        const error = new Error("Email delivery is not configured. Set BREVO_API_KEY and MAIL_FROM_EMAIL.");
        error.statusCode = 503;
        error.code = "EMAIL_NOT_CONFIGURED";
        throw error;
    }
    return { apiKey, fromEmail, fromName };
}
function buildOtpEmail(name, otp, purpose) {
    const safeName = escapeHtml(name || "there");
    const title = purpose === "signup" ? "Verify your Kukin email" : "Reset your Kukin password";
    const intro = purpose === "signup"
        ? "Use the code below to verify your email address and finish creating your account."
        : "Use the code below to reset your Kukin password.";
    const subject = purpose === "signup"
        ? "Your Kukin verification code"
        : "Your Kukin password reset code";
    const htmlContent = `
    <div style="font-family:Arial,sans-serif;background:#05010f;padding:32px;color:#CED4DA">
      <div style="max-width:520px;margin:0 auto;background:#1E1E2F;border-radius:16px;padding:32px">
        <h1 style="color:#1ABC9C;margin:0 0 16px;font-size:24px">${title}</h1>
        <p style="margin:0 0 12px">Hi ${safeName},</p>
        <p style="margin:0 0 24px;line-height:1.6">${intro}</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;text-align:center;background:#05010f;color:#F39C12;padding:18px 12px;border-radius:12px">${otp}</div>
        <p style="margin:24px 0 0;line-height:1.6">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
        <p style="margin:24px 0 0;color:#8b93a7;font-size:13px">— Kukin</p>
      </div>
    </div>
  `;
    const textContent = `${title}\n\nHi ${name || "there"},\n\n${intro}\n\nCode: ${otp}\n\nThis code expires in 10 minutes.`;
    return { subject, htmlContent, textContent };
}
async function sendEmail(to, name, otp, purpose) {
    const { apiKey, fromEmail, fromName } = getBrevoConfig();
    const { subject, htmlContent, textContent } = buildOtpEmail(name, otp, purpose);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const response = await fetch(BREVO_ENDPOINT, {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: { email: fromEmail, name: fromName },
                to: [{ email: to, name: name || undefined }],
                subject,
                htmlContent,
                textContent,
            }),
            signal: controller.signal,
        });
        if (!response.ok) {
            const details = await response.text();
            const error = new Error("Unable to send the verification email right now.");
            error.statusCode = 502;
            error.code = "EMAIL_SEND_FAILED";
            error.details = details.slice(0, 500);
            throw error;
        }
    }
    finally {
        clearTimeout(timer);
    }
}
async function sendSignupOtpEmail(to, name, otp) {
    return sendEmail(to, name, otp, "signup");
}
async function sendResetOtpEmail(to, name, otp) {
    return sendEmail(to, name, otp, "reset");
}
module.exports = {
    sendSignupOtpEmail,
    sendResetOtpEmail,
};
//# sourceMappingURL=email.service.js.map