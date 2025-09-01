"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const productRouter = require("./routes/product.route");
const connectDB = require("./db/connectDB");
const uploadRoutes = require("./routes/upload.route");
// Load environment variables from .env file
dotenv.config();
const app = express();
// Middleware 
app.use(bodyParser.json());
// Connect to MongoDB database
connectDB();
// Product routes
app.use("/products", productRouter);
// Upload routes
app.use("/api/upload", uploadRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`);
    console.log("cloudinary:" + process.env.CLOUDINARY_CLOUD_NAME);
});
//# sourceMappingURL=server.js.map