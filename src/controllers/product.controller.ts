import type { Request, Response } from "express";
import { products,IProduct } from "../models/products.model";

export const getAllProducts = (req: Request, res: Response) => {
  res.json(products);
};

export const getProductById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const product = products.find(f => f.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

export const createProduct = (req: Request, res: Response) => {
  const newProduct: Product = {
    id: products.length + 1,
    ...req.body
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

export const updateProduct = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

export const deleteProduct = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(index, 1);
  res.json({ message: "Product deleted successfully" });
};
