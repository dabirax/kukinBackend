"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");
const router = express.Router();
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
module.exports = router;
//# sourceMappingURL=product.route.js.map