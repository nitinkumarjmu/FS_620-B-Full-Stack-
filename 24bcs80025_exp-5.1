const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================
// 📦 MongoDB Connection
// ==========================
mongoose
  .connect("mongodb://127.0.0.1:27017/ecommerceCatalogDB")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));

// ==========================
// 🧩 Schema & Model
// ==========================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, required: true },
  category: {
    main: { type: String, required: true },
    sub: { type: String },
  },
  variants: [
    {
      color: String,
      size: String,
      stock: Number,
    },
  ],
  reviews: [
    {
      user: String,
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// ==========================
// 🧠 Routes
// ==========================

// 🟢 Create Product
app.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔵 Get All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟣 Get Single Product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟠 Update Product
app.put("/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "✅ Product updated successfully", updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🔴 Delete Product
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("🛍️ Welcome to E-commerce Catalog API (Nested MongoDB Structure)");
});

// ==========================
// 🚀 Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
