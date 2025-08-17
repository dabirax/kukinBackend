"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const data_1 = __importDefault(require("../data"));
// Get all products
const getAllProducts = (req, res) => {
    res.json(data_1.default);
};
exports.getAllProducts = getAllProducts;
// Get a product by its ID
const getProductById = (req, res) => {
    const id = parseInt(req.params.id ?? "0");
    const product = data_1.default.find(f => f.id === id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
};
exports.getProductById = getProductById;
// Create a new product
const createProduct = (req, res) => {
    const newProduct = {
        id: data_1.default.length + 1,
        ...req.body
    };
    data_1.default.push(newProduct);
    res.status(201).json(newProduct);
};
exports.createProduct = createProduct;
// Update an existing product by its ID
const updateProduct = (req, res) => {
    const id = parseInt(req.params.id ?? "0");
    const index = data_1.default.findIndex(f => f.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }
    data_1.default[index] = { ...data_1.default[index], ...req.body };
    res.json(data_1.default[index]);
};
exports.updateProduct = updateProduct;
// Delete a product by its ID
const deleteProduct = (req, res) => {
    const id = parseInt(req.params.id ?? "0");
    const index = data_1.default.findIndex(f => f.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }
    data_1.default.splice(index, 1);
    res.json({ message: "Product deleted successfully" });
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.controller.js.map