"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const uploader = require("../config/cloudinary").uploader;
const { generateOtp, hashOtp, verifyOtp, signAccessToken, signResetToken, verifyToken, toSafeUser, } = require("../utils/auth");
const { normalizeEmail, validateSignup, validateEmail, validatePassword, validateOtp, hasErrors, } = require("../utils/validate");
const { sendSignupOtpEmail, sendResetOtpEmail, } = require("../services/email.service");
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 12;
function createError(statusCode, message, code) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}
function clearOtp(user) {
    user.otpHash = null;
    user.otpPurpose = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
}
async function issueOtp(user, purpose) {
    const otp = generateOtp();
    const now = new Date();
    user.otpHash = hashOtp(otp);
    user.otpPurpose = purpose;
    user.otpExpiresAt = new Date(now.getTime() + OTP_TTL_MS);
    user.otpLastSentAt = now;
    user.otpAttempts = 0;
    await user.save();
    try {
        if (purpose === "signup") {
            await sendSignupOtpEmail(user.email, user.name, otp);
        }
        else {
            await sendResetOtpEmail(user.email, user.name, otp);
        }
    }
    catch (error) {
        user.otpHash = null;
        user.otpPurpose = null;
        user.otpExpiresAt = null;
        user.otpLastSentAt = null;
        user.otpAttempts = 0;
        await user.save();
        throw error;
    }
}
async function signup(req, res) {
    try {
        const { name, email, password, errors } = validateSignup(req.body);
        if (hasErrors(errors)) {
            return res.status(400).json({
                message: "Please fix the highlighted fields",
                code: "VALIDATION_ERROR",
                errors,
            });
        }
        let user = await User.findOne({ email }).select("+otpHash");
        if (user && user.isVerified) {
            return res.status(409).json({
                message: "An account with this email already exists. Please sign in.",
                code: "EMAIL_IN_USE",
            });
        }
        if (user && user.provider !== "local") {
            return res.status(409).json({
                message: "This email is already linked to another sign-in method.",
                code: "EMAIL_IN_USE",
            });
        }
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        if (user) {
            user.name = name;
            user.passwordHash = passwordHash;
            user.provider = "local";
        }
        else {
            user = new User({
                name,
                email,
                passwordHash,
                provider: "local",
            });
        }
        await issueOtp(user, "signup");
        return res.status(201).json({
            message: "Account created. Check your email for the verification code.",
            email,
            requiresVerification: true,
        });
    }
    catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists. Please sign in.",
                code: "EMAIL_IN_USE",
            });
        }
        return res.status(error?.statusCode || 500).json({
            message: error?.message || "Unable to create your account",
            code: error?.code || "SIGNUP_FAILED",
        });
    }
}
async function verifySignupOtp(req, res) {
    try {
        const { email, valid: emailValid } = validateEmail(req.body?.email);
        const { otp, valid: otpValid } = validateOtp(req.body?.otp);
        if (!emailValid || !otpValid) {
            return res.status(400).json({
                message: "Enter your email and the 6-digit code",
                code: "VALIDATION_ERROR",
            });
        }
        const user = await User.findOne({ email }).select("+otpHash");
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification code",
                code: "OTP_INVALID",
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                message: "This email is already verified. Please sign in.",
                code: "ALREADY_VERIFIED",
            });
        }
        if (!user.otpHash ||
            user.otpPurpose !== "signup" ||
            !user.otpExpiresAt ||
            new Date(user.otpExpiresAt).getTime() < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired verification code",
                code: "OTP_INVALID",
            });
        }
        if (Number(user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new code.",
                code: "OTP_ATTEMPTS_EXCEEDED",
            });
        }
        if (!verifyOtp(otp, user.otpHash)) {
            user.otpAttempts = Number(user.otpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({
                message: "Invalid or expired verification code",
                code: "OTP_INVALID",
            });
        }
        user.isVerified = true;
        clearOtp(user);
        await user.save();
        return res.json({
            message: "Email verified. You can now sign in.",
            email,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to verify your email",
            code: error?.code || "OTP_VERIFY_FAILED",
        });
    }
}
async function resendSignupOtp(req, res) {
    try {
        const { email, valid } = validateEmail(req.body?.email);
        if (!valid) {
            return res.status(400).json({
                message: "Enter a valid email address",
                code: "VALIDATION_ERROR",
            });
        }
        const user = await User.findOne({ email }).select("+otpHash");
        if (!user || user.provider !== "local") {
            return res.status(400).json({
                message: "There is no pending sign-up for this email.",
                code: "NO_PENDING_SIGNUP",
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                message: "This email is already verified. Please sign in.",
                code: "ALREADY_VERIFIED",
            });
        }
        if (user.otpLastSentAt) {
            const elapsed = Date.now() - new Date(user.otpLastSentAt).getTime();
            const remaining = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
            if (remaining > 0) {
                return res.status(429).json({
                    message: `Please wait ${remaining}s before requesting another code.`,
                    code: "OTP_COOLDOWN",
                    retryAfter: remaining,
                });
            }
        }
        await issueOtp(user, "signup");
        return res.json({
            message: "A new verification code has been sent.",
            email,
        });
    }
    catch (error) {
        return res.status(error?.statusCode || 500).json({
            message: error?.message || "Unable to resend the verification code",
            code: error?.code || "OTP_RESEND_FAILED",
        });
    }
}
async function login(req, res) {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = String(req.body?.password || "");
        if (!email || !password) {
            return res.status(400).json({
                message: "Enter your email and password",
                code: "VALIDATION_ERROR",
            });
        }
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !user.passwordHash) {
            return res.status(401).json({
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
            });
        }
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) {
            return res.status(401).json({
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
            });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before signing in.",
                code: "EMAIL_NOT_VERIFIED",
                email,
            });
        }
        user.lastLoginAt = new Date();
        await user.save();
        return res.json({
            message: "Signed in successfully",
            token: signAccessToken(user),
            user: toSafeUser(user),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to sign in",
            code: error?.code || "LOGIN_FAILED",
        });
    }
}
async function getMe(req, res) {
    return res.json({ user: toSafeUser(req.user) });
}
async function updateMe(req, res) {
    try {
        const name = String(req.body?.name || "").trim();
        if (name.length < 2 || name.length > 60) {
            return res.status(400).json({
                message: "Name must be between 2 and 60 characters",
                code: "VALIDATION_ERROR",
                errors: { name: "Name must be between 2 and 60 characters" },
            });
        }
        req.user.name = name;
        await req.user.save();
        return res.json({
            message: "Profile updated",
            user: toSafeUser(req.user),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to update your profile",
            code: "PROFILE_UPDATE_FAILED",
        });
    }
}
async function uploadAvatar(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "Choose an image to upload",
            code: "NO_FILE",
        });
    }
    try {
        const result = await uploader.upload(req.file.path, {
            folder: "kukin/avatars",
            transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "auto" },
            ],
        });
        req.user.avatarUrl = result.secure_url;
        await req.user.save();
        return res.json({
            message: "Avatar updated",
            user: toSafeUser(req.user),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to upload your avatar",
            code: "AVATAR_UPLOAD_FAILED",
        });
    }
    finally {
        try {
            if (req.file?.path)
                fs.unlinkSync(req.file.path);
        }
        catch {
            // Ignore cleanup failures.
        }
    }
}
async function changePassword(req, res) {
    try {
        const currentPassword = String(req.body?.currentPassword || "");
        const newPassword = String(req.body?.newPassword || "");
        const confirmPassword = String(req.body?.confirmPassword || "");
        const { valid } = validatePassword(newPassword);
        if (!valid) {
            return res.status(400).json({
                message: "New password must be at least 8 characters",
                code: "VALIDATION_ERROR",
                errors: { newPassword: "Password must be at least 8 characters" },
            });
        }
        if (confirmPassword && confirmPassword !== newPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                code: "VALIDATION_ERROR",
                errors: { confirmPassword: "Passwords do not match" },
            });
        }
        if (req.user.passwordHash) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: "Enter your current password",
                    code: "VALIDATION_ERROR",
                    errors: { currentPassword: "Current password is required" },
                });
            }
            const matches = await bcrypt.compare(currentPassword, req.user.passwordHash);
            if (!matches) {
                return res.status(400).json({
                    message: "Your current password is incorrect",
                    code: "INVALID_PASSWORD",
                    errors: { currentPassword: "Current password is incorrect" },
                });
            }
        }
        req.user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        req.user.tokenVersion = Number(req.user.tokenVersion || 0) + 1;
        await req.user.save();
        return res.json({
            message: "Password updated. Other sessions have been signed out.",
            token: signAccessToken(req.user),
            user: toSafeUser(req.user),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to update your password",
            code: "PASSWORD_UPDATE_FAILED",
        });
    }
}
async function logout(_req, res) {
    return res.status(204).send();
}
async function forgotPassword(req, res) {
    const genericMessage = "If an account exists for that email, a reset code has been sent.";
    try {
        const { email, valid } = validateEmail(req.body?.email);
        if (!valid) {
            return res.status(400).json({
                message: "Enter a valid email address",
                code: "VALIDATION_ERROR",
            });
        }
        const user = await User.findOne({ email }).select("+otpHash +passwordHash");
        if (user && user.provider === "local" && user.passwordHash) {
            if (user.otpLastSentAt) {
                const elapsed = Date.now() - new Date(user.otpLastSentAt).getTime();
                if (elapsed < OTP_RESEND_COOLDOWN_MS) {
                    return res.status(202).json({ message: genericMessage });
                }
            }
            try {
                await issueOtp(user, "reset");
            }
            catch (error) {
                console.error("Password reset email failed:", error?.message || error);
            }
        }
        return res.status(202).json({ message: genericMessage });
    }
    catch {
        return res.status(202).json({ message: genericMessage });
    }
}
async function verifyResetOtp(req, res) {
    try {
        const { email, valid: emailValid } = validateEmail(req.body?.email);
        const { otp, valid: otpValid } = validateOtp(req.body?.otp);
        if (!emailValid || !otpValid) {
            return res.status(400).json({
                message: "Enter your email and the 6-digit code",
                code: "VALIDATION_ERROR",
            });
        }
        const user = await User.findOne({ email }).select("+otpHash");
        if (!user ||
            !user.otpHash ||
            user.otpPurpose !== "reset" ||
            !user.otpExpiresAt ||
            new Date(user.otpExpiresAt).getTime() < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired reset code",
                code: "OTP_INVALID",
            });
        }
        if (Number(user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new code.",
                code: "OTP_ATTEMPTS_EXCEEDED",
            });
        }
        if (!verifyOtp(otp, user.otpHash)) {
            user.otpAttempts = Number(user.otpAttempts || 0) + 1;
            await user.save();
            return res.status(400).json({
                message: "Invalid or expired reset code",
                code: "OTP_INVALID",
            });
        }
        clearOtp(user);
        await user.save();
        return res.json({
            message: "Code verified. Choose a new password.",
            resetToken: signResetToken(String(user._id), user.tokenVersion),
            email,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to verify the reset code",
            code: "OTP_VERIFY_FAILED",
        });
    }
}
async function resetPassword(req, res) {
    try {
        const resetToken = String(req.body?.resetToken || "");
        const newPassword = String(req.body?.newPassword || "");
        const confirmPassword = String(req.body?.confirmPassword || "");
        const { valid } = validatePassword(newPassword);
        if (!resetToken) {
            return res.status(400).json({
                message: "Your reset session is missing. Request a new code.",
                code: "RESET_TOKEN_MISSING",
            });
        }
        if (!valid) {
            return res.status(400).json({
                message: "New password must be at least 8 characters",
                code: "VALIDATION_ERROR",
                errors: { newPassword: "Password must be at least 8 characters" },
            });
        }
        if (confirmPassword && confirmPassword !== newPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                code: "VALIDATION_ERROR",
                errors: { confirmPassword: "Passwords do not match" },
            });
        }
        let payload;
        try {
            payload = verifyToken(resetToken, "reset");
        }
        catch {
            return res.status(401).json({
                message: "Your reset session has expired. Request a new code.",
                code: "RESET_TOKEN_INVALID",
            });
        }
        const user = await User.findById(payload.sub).select("+otpHash");
        if (!user ||
            Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
            return res.status(401).json({
                message: "Your reset session is no longer valid. Request a new code.",
                code: "RESET_TOKEN_INVALID",
            });
        }
        user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        user.isVerified = true;
        user.tokenVersion = Number(user.tokenVersion || 0) + 1;
        clearOtp(user);
        await user.save();
        return res.json({
            message: "Password reset successfully. You can now sign in.",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error?.message || "Unable to reset your password",
            code: "PASSWORD_RESET_FAILED",
        });
    }
}
function providers(_req, res) {
    return res.json({ google: false, github: false });
}
function oauthNotImplemented(_req, res) {
    return res.status(501).json({
        message: "Social sign-in is coming soon.",
        code: "OAUTH_NOT_IMPLEMENTED",
    });
}
module.exports = {
    signup,
    verifySignupOtp,
    resendSignupOtp,
    login,
    getMe,
    updateMe,
    uploadAvatar,
    changePassword,
    logout,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    providers,
    oauthNotImplemented,
};
//# sourceMappingURL=auth.controller.js.map