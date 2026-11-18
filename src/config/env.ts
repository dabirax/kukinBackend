const REQUIRED_ENV = [
  "MONGO_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "BREVO_API_KEY",
  "MAIL_FROM_EMAIL",
  "JWT_SECRET",
  "OTP_SECRET",
  "FRONTEND_URL",
  "CORS_ORIGINS",
  "PAYSTACK_SECRET_KEY",
  "DELIVERY_FEE_NAIRA",
];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !String(process.env[key] || "").trim());

  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing environment variables (values not printed): ${missing.join(", ")}`
    );
  }

  return missing;
}

module.exports = { validateEnv };
