require('dotenv').config();
const mysql = require('mysql2/promise');

async function runTest() {
  const conn = await mysql.createConnection({ 
    uri: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    const productId = "test_" + Date.now();
    const initialImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500";
    const updatedImage = "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500";
    const initialName = "Test Product Before Edit";
    const updatedName = "Test Product After Edit";

    console.log("1. Adding new product...");
    await conn.execute(
      "INSERT INTO store_products (id, name, category, description, imageUrl, priceHalalas, costHalalas, stock, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
      [productId, initialName, "Shoes", "Test Description", initialImage, 15000, 5000, 10]
    );
    console.log("✅ Product added! (ID: " + productId + ")");

    console.log("2. Updating same product...");
    await conn.execute(
      "UPDATE store_products SET name=?, imageUrl=?, priceHalalas=? WHERE id=?",
      [updatedName, updatedImage, 20000, productId]
    );
    console.log("✅ Product updated!");

    console.log("\n3. Reading from DB:");
    const [rows] = await conn.query("SELECT id, name, imageUrl, priceHalalas FROM store_products WHERE id = ?", [productId]);
    console.table(rows);

    console.log("\nTest finished. Go to localhost:3000 to check the product.");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await conn.end();
  }
}

runTest();
