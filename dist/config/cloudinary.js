"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config({ path: "../../.env" });
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Undefined",
    api_key: process.env.CLOUDINARY_API_KEY || "Undefined",
    api_secret: process.env.CLOUDINARY_API_SECRET || "Undefined",
});
console.log("cloudinary:", process.env.CLOUDINARY_CLOUD_NAME);
module.exports = cloudinary;
//# sourceMappingURL=cloudinary.js.map