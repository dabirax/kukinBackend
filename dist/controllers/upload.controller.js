"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = require("../config/cloudinary");
const uploadController = {
    uploadImage: async (req, res) => {
        try {
            console.log(req.file);
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "uploads",
            });
            res.status(200).json({
                message: "File uploaded successfully",
                url: result.secure_url,
                public_id: result.public_id,
            });
        }
        catch (err) {
            res.status(500).json({ message: "Upload failed", error: err.message });
        }
    },
};
module.exports = uploadController;
//# sourceMappingURL=upload.controller.js.map