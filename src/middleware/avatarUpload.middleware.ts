const fs = require("fs");
const path = require("path");
const multer = require("multer");

const destination = path.join(process.cwd(), "assets");
fs.mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req: any, _file: any, cb: any) {
    cb(null, destination);
  },
  filename: function (_req: any, file: any, cb: any) {
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
  fileFilter: function (_req: any, file: any, cb: any) {
    if (String(file.mimetype || "").startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image files are allowed"));
  },
});

module.exports = avatarUpload;
