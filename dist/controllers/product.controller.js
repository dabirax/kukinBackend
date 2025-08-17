"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products = require("../data");
// Get all products
function getAllProducts(req, res) {
    res.json(products);
}
// Get a product by its ID
function getProductById(req, res) {
    const id = parseInt(req.params.id ?? "0");
    const product = products.find((f) => f.id === id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
}
// Create a new product
function createProduct(req, res) {
    const newProduct = {
        id: products.length + 1,
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
}
// Update an existing product by its ID
function updateProduct(req, res) {
    const id = parseInt(req.params.id ?? "0");
    const index = products.findIndex((f) => f.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
}
// Delete a product by its ID
function deleteProduct(req, res) {
    const id = parseInt(req.params.id ?? "0");
    const index = products.findIndex((f) => f.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }
    products.splice(index, 1);
    res.json({ message: "Product deleted successfully" });
}
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
//# sourceMappingURL=product.controller.js.map