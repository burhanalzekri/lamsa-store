const mysql = require('mysql2/promise');

async function migrate() {
  // 1. الاتصال بقاعدة البيانات المحلية
  const localConn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'lamsa',
    port: 3306
  });
  console.log('🔗 تم الاتصال بقاعدة البيانات المحلية.');

  // 2. الاتصال بقاعدة البيانات السحابية
  const cloudConn = await mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'qEkQbPj3pswiuoL.root',
    password: 'hGzZRFxVarakZ9yz',
    ssl: { rejectUnauthorized: true },
    database: 'lamsa'
  });
  console.log('🔗 تم الاتصال بقاعدة البيانات السحابية.');

  // 3. تصدير واستيراد المنتجات
  const [products] = await localConn.query('SELECT * FROM store_products');
  console.log(`📦 تم جلب ${products.length} منتجاً من الجهاز.`);

  for (const p of products) {
    await cloudConn.query(
      `INSERT IGNORE INTO store_products (id, name, description, category, imageUrl, images, priceHalalas, costHalalas, compareAtHalalas, badge, material, rating, stock, active, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.description, p.category, p.imageUrl, p.images, p.priceHalalas, p.costHalalas, p.compareAtHalalas, p.badge, p.material, p.rating, p.stock, p.active, p.createdAt]
    );
  }
  console.log('✅ تم استيراد المنتجات إلى السحابة.');

  // 4. تصدير واستيراد المتغيرات
  const [variants] = await localConn.query('SELECT * FROM product_variants');
  console.log(`🎨 تم جلب ${variants.length} متغيراً.`);
  for (const v of variants) {
    await cloudConn.query(
      `INSERT IGNORE INTO product_variants (id, productId, color, size, price, stock, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.productId, v.color, v.size, v.price, v.stock, v.createdAt]
    );
  }
  console.log('✅ تم استيراد المتغيرات.');

  // 5. تصدير واستيراد الطلبات
  const [orders] = await localConn.query('SELECT * FROM store_orders');
  console.log(`🛒 تم جلب ${orders.length} طلباً.`);
  for (const o of orders) {
    await cloudConn.query(
      `INSERT IGNORE INTO store_orders (id, orderNumber, userId, customerName, phone, address, city, customerEmail, items, totalAmount, subtotalHalalas, totalHalalas, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, o.orderNumber, o.userId, o.customerName, o.phone, o.address, o.city, o.customerEmail, o.items, o.totalAmount, o.subtotalHalalas, o.totalHalalas, o.status, o.createdAt]
    );
  }
  console.log('✅ تم استيراد الطلبات.');

  // 6. تصدير واستيراد المستخدمين
  const [users] = await localConn.query('SELECT * FROM users');
  console.log(`👤 تم جلب ${users.length} مستخدماً.`);
  for (const u of users) {
    await cloudConn.query(
      `INSERT IGNORE INTO users (id, name, email, password, role, openId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.password, u.role, u.openId, u.createdAt]
    );
  }
  console.log('✅ تم استيراد المستخدمين.');

  await localConn.end();
  await cloudConn.end();
  console.log('🎉 تم نقل جميع البيانات إلى السحابة بنجاح!');
}

migrate().catch(console.error);
