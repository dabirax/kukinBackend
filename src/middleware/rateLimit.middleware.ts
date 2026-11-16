const { rateLimit } = require("express-rate-limit");

function createLimiter(options: any) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      message: options.message || "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
    },
  });
}

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many sign-in attempts. Please wait a few minutes and try again.",
});

const signupLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: "Too many sign-up attempts. Please try again later.",
});

const otpLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  message: "Too many verification attempts. Please wait and try again.",
});

const forgotPasswordLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  message: "Too many password reset requests. Please try again later.",
});

module.exports = {
  loginLimiter,
  signupLimiter,
  otpLimiter,
  forgotPasswordLimiter,
};
