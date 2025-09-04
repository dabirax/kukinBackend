const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const { uploadImage, uploadLocalAsset } = require("../controllers/upload.controller");


// Postman upload (form-data)
router.post("/", upload.single("image"), uploadImage);

// Local assets upload
router.post("/local", uploadLocalAsset);


module.exports = router;