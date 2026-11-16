"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require("../models/user.model");
const { verifyToken } = require("../utils/auth");
function readToken(req) {
    const header = String(req.headers.authorization || "");
    return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}
async function requireAuth(req, res, next) {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
                code: "AUTH_REQUIRED",
            });
        }
        const payload = verifyToken(token, "access");
        const user = await User.findById(payload.sub);
        if (!user) {
            return res.status(401).json({
                message: "Your session is no longer valid",
                code: "AUTH_INVALID",
            });
        }
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before continuing",
                code: "EMAIL_NOT_VERIFIED",
            });
        }
        if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
            return res.status(401).json({
                message: "Your session has expired. Please sign in again.",
                code: "AUTH_EXPIRED",
            });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Your session is invalid. Please sign in again.",
            code: "AUTH_INVALID",
        });
    }
}
async function optionalAuth(req, _res, next) {
    const token = readToken(req);
    if (!token) {
        return next();
    }
    try {
        const payload = verifyToken(token, "access");
        const user = await User.findById(payload.sub);
        if (user &&
            user.isVerified &&
            Number(payload.tokenVersion || 0) === Number(user.tokenVersion || 0)) {
            req.user = user;
        }
    }
    catch {
        // Public reads are still allowed when the supplied token is invalid.
    }
    return next();
}
module.exports = { requireAuth, optionalAuth };
//# sourceMappingURL=auth.middleware.js.map