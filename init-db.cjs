const mysql = require('mysql2/promise');

async function initDB() {
  const conn = await mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'qEkQbPj3pswiuoL.root',
    password: 'hGzZRFxVarakZ9yz',
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });

  console.log('🔗 تم الاتصال بقاعدة TiDB!');

  // إنشاء قاعدة البيانات lamsa
  await conn.query('CREATE DATABASE IF NOT EXISTS lamsa;');
  await conn.query('USE lamsa;');
  console.log('✅ تم إنشاء قاعدة البيانات lamsa!');

  // إنشاء الجداول
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      openId VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS store_products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      imageUrl VARCHAR(500),
      images TEXT,
      priceHalalas INT NOT NULL,
      costHalalas INT DEFAULT 0,
      compareAtHalalas INT,
      badge VARCHAR(50),
      material VARCHAR(100),
      rating DECIMAL(2,1) DEFAULT 4.5,
      stock INT DEFAULT 20,
      active BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      size VARCHAR(20) NOT NULL,
      price INT NOT NULL,
      stock INT DEFAULT 10,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_variant (productId, color, size)
    );`,
    `CREATE TABLE IF NOT EXISTS store_orders (
      id VARCHAR(50) PRIMARY KEY,
      orderNumber VARCHAR(50),
      userId INT NULL,
      customerName VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT,
      city VARCHAR(100),
      customerEmail VARCHAR(255),
      items TEXT NOT NULL,
      totalAmount INT NOT NULL,
      subtotalHalalas INT DEFAULT 0,
      totalHalalas INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productId VARCHAR(50) NOT NULL,
      userName VARCHAR(100) NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      imageUrl VARCHAR(500),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS wishlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userEmail VARCHAR(255) NOT NULL,
      productId VARCHAR(50) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_wish (userEmail, productId)
    );`,
    `CREATE TABLE IF NOT EXISTS carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userEmail VARCHAR(255) NOT NULL,
      productId VARCHAR(50) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      color VARCHAR(50),
      size VARCHAR(20),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_cart (userEmail, productId, color, size)
    );`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discountPercent INT NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type VARCHAR(50) DEFAULT 'info',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY DEFAULT 1,
      storeName VARCHAR(255) DEFAULT 'متجر لمسة',
      logoUrl VARCHAR(500),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      facebook VARCHAR(255),
      instagram VARCHAR(255),
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`
  ];

  for (const table of tables) {
    await conn.query(table);
  }
  console.log('✅ تم إنشاء جميع الجداول بنجاح!');

  // إضافة حساب المدير الافتراضي (كلمة المرور: admin123)
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash('admin123', 10);
  await conn.query(
    `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['مدير المتجر', 'admin@lamsa.com', hashed, 'admin']
  );
  console.log('✅ تم إنشاء حساب المدير (admin@lamsa.com / admin123)!');

  await conn.end();
  console.log('🎉 قاعدة البيانات جاهزة للاستخدام!');
}

initDB().catch(console.error);
