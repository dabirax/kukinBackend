"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, _req, res, _next) {
    if (err?.name === "MulterError") {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5MB or smaller"
            : "Unable to upload that image";
        return res.status(400).json({ message, code: err.code });
    }
    if (err?.message === "Only image files are allowed") {
        return res.status(400).json({
            message: "Only image files are allowed",
            code: "INVALID_FILE_TYPE",
        });
    }
    console.error("Unhandled request error:", err?.message || err);
    return res.status(err?.statusCode || 500).json({
        message: err?.message || "Something went wrong",
        code: err?.code || "INTERNAL_ERROR",
    });
}
module.exports = errorHandler;
//# sourceMappingURL=errorHandler.js.map