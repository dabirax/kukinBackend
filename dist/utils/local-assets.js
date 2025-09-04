"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const cloudinary = require("../config/cloudinary");
const path = require("path");
// Load environment variables
dotenv.config();
console.log("Cloudinary config: ", cloudinary.config().cloud_name);
const imagePath = path.join(__dirname, "../../assets/okra.jpg");
cloudinary.uploader
    .upload(imagePath, {
    resource_type: "image",
    folder: "kukin",
})
    .then((result) => {
    console.log("success", JSON.stringify(result, null, 2));
})
    .catch((error) => {
    console.log("error", JSON.stringify(error, null, 2));
});
//# sourceMappingURL=local-assets.js.map