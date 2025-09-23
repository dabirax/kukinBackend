"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, bulkUploadProducts } = require("../controllers/product.controller");
const router = express.Router();
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
// 👇 bulk upload route
router.post("/bulk", bulkUploadProducts);
module.exports = router;
//# sourceMappingURL=product.route.js.map