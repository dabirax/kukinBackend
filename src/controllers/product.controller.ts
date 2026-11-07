const Product = require("../models/products.model");

// Get all products
async function getAllProducts(req: any, res: any) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
}

// Get a product by its ID (MongoDB _id or your custom id)
async function getProductById(req: any, res: any) {
  try {
    const { id } = req.params;

    // if MongoDB ObjectId
    // const product = await Product.findById(id);

    //  If custom `id` field, use:
    const product = await Product.findOne({ id: parseInt(id) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
}

// Create a new product
async function createProduct(req: any, res: any) {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: "Error creating product", error: err.message });
  }
}

// Update an existing product by its ID
async function updateProduct(req: any, res: any) {
  try {
    const { id } = req.params;

    const updated = await Product.findOneAndUpdate({ id: parseInt(id) }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: "Error updating product", error: err.message });
  }
}

// Delete a product by its ID
async function deleteProduct(req: any, res: any) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product id (must be a number)" });
    }

    const deleted = await Product.findOneAndDelete({id: id });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
}

// Bulk upload with upsert (insert or update)
async function bulkUploadProducts(req: any, res: any) {
  try {
    const products = req.body; // Expecting an array of products

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array" });
    }

    const bulkOps = products.map((product: any) => ({
      updateOne: {
        filter: { id: product.id },       // match on custom id
        update: { $set: product },        // update if exists
        upsert: true,                     // insert if not exists
      },
    }));

    const result = await Product.bulkWrite(bulkOps);

    res.status(201).json({
      message: "Bulk upload completed",
      matched: result.matchedCount,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error uploading products",
      error: err.message,
    });
  }
}



module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts
};
