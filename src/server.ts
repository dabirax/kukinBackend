
import express from "express";
import type { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import productRouter from "./routes/product.route";
import connectDB from "./db/connectDB";

// Load environment variables from .env file
dotenv.config();

const app: Application = express();

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
