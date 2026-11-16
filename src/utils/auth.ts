const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const OTP_LENGTH = 6;

function getSecret(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function generateOtp() {
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

function hashOtp(otp: string) {
  return crypto
    .createHmac("sha256", getSecret("OTP_SECRET"))
    .update(String(otp))
    .digest("hex");
}

function verifyOtp(otp: string, storedHash: string) {
  if (!otp || !storedHash) return false;

  const expected = Buffer.from(hashOtp(otp), "hex");
  const actual = Buffer.from(String(storedHash), "hex");

  return (
    expected.length === actual.length &&
    crypto.timingSafeEqual(expected, actual)
  );
}

function signAccessToken(user: any) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
      purpose: "access",
    },
    getSecret("JWT_SECRET"),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any
  );
}

function signResetToken(userId: string, tokenVersion = 0) {
  return jwt.sign(
    {
      sub: String(userId),
      tokenVersion: Number(tokenVersion) || 0,
      purpose: "reset",
    },
    getSecret("JWT_SECRET"),
    { expiresIn: "10m" } as any
  );
}

function verifyToken(token: string, purpose: string) {
  const payload = jwt.verify(token, getSecret("JWT_SECRET")) as any;

  if (!payload || payload.purpose !== purpose) {
    throw new Error("Invalid token purpose");
  }

  return payload;
}

function toSafeUser(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    provider: user.provider || "local",
    role: user.role || "customer",
    isVerified: Boolean(user.isVerified),
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt,
  };
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp,
  signAccessToken,
  signResetToken,
  verifyToken,
  toSafeUser,
};
