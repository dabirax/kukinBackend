import type { Request, Response } from "express";
import type { IProduct } from "../models/products.model";
import products from "../data"; 

// Get all products
export const getAllProducts = (req: Request, res: Response) => {
  res.json(products);
};

// Get a product by its ID
export const getProductById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "0");
  const product = products.find(f => f.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

// Create a new product
export const createProduct = (req: Request, res: Response) => {
  const newProduct: IProduct = {
    id: products.length + 1,
    ...req.body
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

// Update an existing product by its ID
export const updateProduct = (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "0");
  const index = products.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

// Delete a product by its ID
export const deleteProduct = (req: Request, res: Response) => {
  const id = parseInt(req.params.id ?? "0");
  const index = products.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(index, 1);
  res.json({ message: "Product deleted successfully" });
};
