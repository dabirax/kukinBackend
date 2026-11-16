"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const destination = path.join(process.cwd(), "assets");
fs.mkdirSync(destination, { recursive: true });
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, destination);
    },
    filename: function (_req, file, cb) {
        const extension = path.extname(file.originalname || "").toLowerCase();
        const safeExtension = /^\.(jpe?g|png|webp|gif)$/.test(extension)
            ? extension
            : ".jpg";
        cb(null, `avatar-${Date.now()}-${Math.random().toString(36).slice(2)}${safeExtension}`);
    },
});
const avatarUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: function (_req, file, cb) {
        if (String(file.mimetype || "").startsWith("image/")) {
            cb(null, true);
            return;
        }
        cb(new Error("Only image files are allowed"));
    },
});
module.exports = avatarUpload;
//# sourceMappingURL=avatarUpload.middleware.js.map