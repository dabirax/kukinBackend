"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "../../.env" });
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Undefined",
    api_key: process.env.CLOUDINARY_API_KEY || "Undefined",
    api_secret: process.env.CLOUDINARY_API_SECRET || "Undefined",
});
console.log("✅ Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "loaded" : "missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : "missing",
});
module.exports = cloudinary;
//# sourceMappingURL=cloudinary.js.map