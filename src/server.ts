import express from "express";
import type { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./db/connect.js";

dotenv.config();

const app: Application = express();
app.use(bodyParser.json());
	
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
