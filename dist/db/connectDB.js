"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
module.exports = connectDB;
//# sourceMappingURL=connectDB.js.map