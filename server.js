const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Simulated product data
const products = [
  { id: 1, name: 'Product A', price: 100 },
  { id: 2, name: 'Product B', price: 200 },
  { id: 3, name: 'Product C', price: 300 },
];

// API endpoint to fetch products
app.get('/api/products', (req, res) => {
  try {
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});