const path = require("path");
const uploader = require("../config/cloudinary").uploader;
const fs = require("fs");

const uploadController = {
  // 🔹 Upload via Postman (multer)
  uploadImage: async (req: any, res: any) => {
    try {
      console.log(req.file, "\n hello");
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

    // Make sure cloudinary.uploader exists here 👇
      console.log("cloudinary.uploader:", typeof uploader);
      
    // Upload file from local storage to Cloudinary
      const result = await uploader.upload(req.file.path, {
        folder: "kukin",
      });

      
    // Remove local file after uploading to cloud
    fs.unlinkSync(req.file.path);

      res.status(200).json({
        message: "File uploaded successfully",
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },

  // 🔹 Upload a fixed local asset
  uploadLocalAsset: async (req: any, res: any) => {
    try {
      const imagePath = path.join(__dirname, "../../assets/moimoi.jpg"); // change as needed

      const result = await uploader.upload(imagePath, {
        folder: "kukin",
      });

      res.status(200).json({
        message: "Local asset uploaded successfully",
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
};

module.exports = uploadController;
