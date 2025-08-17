const products = require("../data");

// Get all products
function getAllProducts(req: any, res: any) {
  res.json(products);
}

// Get a product by its ID
function getProductById(req: any, res: any) {
  const id = parseInt(req.params.id ?? "0");
  const product = products.find((f: any) => f.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
}

// Create a new product
function createProduct(req: any, res: any) {
  const newProduct = {
    id: products.length + 1,
    ...req.body
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
}

// Update an existing product by its ID
function updateProduct(req: any, res: any) {
  const id = parseInt(req.params.id ?? "0");
  const index = products.findIndex((f: any) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
}

// Delete a product by its ID
function deleteProduct(req: any, res: any) {
  const id = parseInt(req.params.id ?? "0");
  const index = products.findIndex((f: any) => f.id === id);

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
