const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadController = {
  // 🔹 Upload via Postman (multer)
  uploadImage: async (req: any, res: any) => {
    try {
      console.log(req.file);
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
      });

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
      const imagePath = path.join(__dirname, "../../assets/egusi.jpg"); // change as needed

      const result = await cloudinary.uploader.upload(imagePath, {
        folder: "uploads",
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
