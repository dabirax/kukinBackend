"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const connectDB_1 = __importDefault(require("./db/connectDB"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware 
app.use(body_parser_1.default.json());
// Connect to MongoDB database
(0, connectDB_1.default)();
// Product routes
app.use("/products", product_route_1.default);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map