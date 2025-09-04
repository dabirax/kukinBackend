const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Undefined",
  api_key: process.env.CLOUDINARY_API_KEY || "Undefined",
  api_secret: process.env.CLOUDINARY_API_SECRET || "Undefined",
});

module.exports = cloudinary;
