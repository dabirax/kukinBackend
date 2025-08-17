const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const productRouter = require("./routes/product.route");
const connectDB = require("./db/connectDB");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware 
app.use(bodyParser.json());

// Connect to MongoDB database
connectDB();

// Product routes
app.use("/products", productRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
