"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
    id: { type: Number, required: true },
    foodType: { type: String, required: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String, required: true },
    amount: { type: Number, default: 1 },
    // homepage 
    isFav: { type: Boolean, default: false }, // favorites
    isFresh: { type: Boolean, default: false }, // Today’s special
    isPopular: { type: Boolean, default: false }, // Top selling
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);
//# sourceMappingURL=products.model.js.map