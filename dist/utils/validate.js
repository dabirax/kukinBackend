"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;
function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}
function validateSignup(body) {
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");
    const errors = {};
    if (name.length < 2 || name.length > 60) {
        errors.name = "Name must be between 2 and 60 characters";
    }
    if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Enter a valid email address";
    }
    if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    }
    return { name, email, password, errors };
}
function validateEmail(value) {
    const email = normalizeEmail(value);
    return {
        email,
        valid: EMAIL_PATTERN.test(email),
    };
}
function validatePassword(value) {
    const password = String(value || "");
    return {
        password,
        valid: password.length >= 8,
    };
}
function validateOtp(value) {
    const otp = String(value || "").trim();
    return {
        otp,
        valid: OTP_PATTERN.test(otp),
    };
}
function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
module.exports = {
    normalizeEmail,
    validateSignup,
    validateEmail,
    validatePassword,
    validateOtp,
    hasErrors,
};
//# sourceMappingURL=validate.js.map