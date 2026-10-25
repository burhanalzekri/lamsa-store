import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "lamsa_secret_2026";
const getConn = async () => {
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      return mysql.createConnection({
        host: url.hostname,
        port: Number(url.port) || 4000,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        ssl: { rejectUnauthorized: true }
      });
    }
    return mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'lamsa', port: 3306 });
  };

const requireAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "يجب تسجيل الدخول" });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: "صلاحيات غير كافية" });
    next();
  } catch (e) { res.status(401).json({ error: "جلسة منتهية" }); }
};

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));

  // --- مسارات المتجر العامة ---
  app.get("/api/products", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM store_products WHERE active = 1 ORDER BY createdAt DESC');
      await conn.end();
      const formatted = (rows as any[]).map((p: any) => ({
        id: p.id, name: p.name, category: p.category, description: p.description,
        image: p.imageUrl, images: p.images, price: p.priceHalalas / 100, 
        compareAtHalalas: p.compareAtHalalas, badge: p.badge, material: p.material, rating: p.rating
      }));
      res.json(formatted);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM store_products WHERE id = ?', [req.params.id]);
      await conn.end();
      if (rows.length === 0) return res.status(404).json({ error: "المنتج غير موجود" });
      const p = rows[0];
      res.json({
        id: p.id, name: p.name, category: p.category, description: p.description,
        image: p.imageUrl, images: p.images, price: p.priceHalalas / 100, 
        compareAtHalalas: p.compareAtHalalas, badge: p.badge, material: p.material, rating: p.rating, stock: 20
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/products/:id/related", async (req, res) => {
    try {
      const conn = await getConn();
      const [prod]: any = await conn.execute('SELECT category FROM store_products WHERE id = ?', [req.params.id]);
      if (prod.length === 0) return res.json([]);
      const [rows] = await conn.execute('SELECT * FROM store_products WHERE category = ? AND id != ? AND active = 1 LIMIT 4', [prod[0].category, req.params.id]);
      await conn.end();
      const formatted = (rows as any[]).map((p: any) => ({
        id: p.id, name: p.name, category: p.category, image: p.imageUrl, price: p.priceHalalas / 100, compareAtHalalas: p.compareAtHalalas, rating: p.rating
      }));
      res.json(formatted);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- مسارات الحسابات ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const conn = await getConn();
      const [existing]: any = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) { await conn.end(); return res.status(400).json({ error: "البريد مسجل مسبقاً" }); }
      const hashed = await bcrypt.hash(password, 10);
      await conn.execute('INSERT INTO users (name, email, password, role, openId) VALUES (?, ?, ?, "user", ?)', [name, email, hashed, email]);
      await conn.end(); res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
      await conn.end();
      if (rows.length === 0) return res.status(401).json({ error: "بيانات خاطئة" });
      const user = rows[0];
      if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "بيانات خاطئة" });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "غير مصرح" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const conn = await getConn();
      const [userRows]: any = await conn.execute('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      // جلب طلبات العميل بناء على بريده الإلكتروني
      const [orderRows]: any = await conn.execute('SELECT * FROM store_orders WHERE customerEmail = ? ORDER BY createdAt DESC', [decoded.email]);
      await conn.end();
      res.json({ user: userRows[0], orders: orderRows });
    } catch (e) { res.status(401).json({ error: "جلسة منتهية" }); }
  });

  // --- مسارات الطلبات ---
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerName, phone, address, items, totalAmount, customerEmail } = req.body;
      const conn = await getConn();
      const id = 'LMS-' + Date.now().toString().slice(-6);
      
      // حفظ الطلب
      await conn.execute(
        'INSERT INTO store_orders (id, orderNumber, userId, customerName, phone, address, city, items, totalAmount, subtotalHalalas, totalHalalas, customerEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, id, null, customerName, phone, address, null, JSON.stringify(items), totalAmount, 0, totalAmount * 100, customerEmail || null]
      );

      // خصم المخزون
      for (const item of items) {
        await conn.execute('UPDATE store_products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [item.quantity, item.id]);
      }

      await conn.end();
      res.json({ success: true, orderId: id });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM store_orders WHERE id = ?', [req.params.id]);
      await conn.end();
      if (rows.length === 0) return res.status(404).json({ error: "الطلب غير موجود" });
      res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/orders/track-by-phone/:phone", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM store_orders WHERE phone = ? ORDER BY createdAt DESC', [req.params.phone]);
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- مسارات الإدارة ---
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [p]: any = await conn.execute('SELECT COUNT(*) as count FROM store_products WHERE active = 1');
      const [o]: any = await conn.execute('SELECT COUNT(*) as count FROM store_orders');
      const [r]: any = await conn.execute('SELECT SUM(totalAmount) as total FROM store_orders WHERE status != "cancelled"');
      const [l]: any = await conn.execute('SELECT COUNT(*) as count FROM store_products WHERE stock <= 5 AND active = 1');
      const [po]: any = await conn.execute('SELECT COUNT(*) as count FROM store_orders WHERE status = "pending"');
      await conn.end();
      res.json({ products: p[0].count, orders: o[0].count, revenue: r[0].total || 0, lowStock: l[0].count, pendingOrders: po[0].count });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM store_orders ORDER BY createdAt DESC');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const conn = await getConn();
      await conn.execute('UPDATE store_orders SET status = ? WHERE id = ?', [status, req.params.id]);
      // إضافة إشعار
      const statusMessages: any = { pending: 'قيد الانتظار', shipped: 'تم الشحن', completed: 'تم التوصيل', cancelled: 'ملغي' };
      await conn.execute('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)', ['تحديث حالة الطلب', 'طلبك رقم ' + req.params.id + ' أصبح: ' + (statusMessages[status] || status), 'order']);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT id, name, email, role FROM users ORDER BY id DESC');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  
  // التحقق من الكوبون (للعميل)
  app.get("/api/coupons/validate/:code", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM coupons WHERE code = ? AND active = 1', [req.params.code]);
      await conn.end();
      if (rows.length === 0) return res.status(404).json({ error: "الكوبون غير صالح أو منتهي" });
      res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // إنشاء كوبون (للمدير)
  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const { code, discountPercent } = req.body;
      const conn = await getConn();
      await conn.execute('INSERT INTO coupons (code, discountPercent) VALUES (?, ?)', [code.toUpperCase(), discountPercent]);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // جلب الكوبونات (للمدير)
  app.get("/api/admin/coupons", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM coupons ORDER BY id DESC');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب تقييمات منتج معين
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC', [req.params.id]);
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // إضافة تقييم جديد
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const { userName, rating, comment, imageUrl } = req.body;
      const conn = await getConn();
      await conn.execute('INSERT INTO reviews (productId, userName, rating, comment, imageUrl) VALUES (?, ?, ?, ?, ?)', [req.params.id, userName, rating, comment, imageUrl || null]);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب الإعدادات
  app.get("/api/settings", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM settings WHERE id = 1');
      await conn.end();
      res.json(rows[0] || {});
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // حفظ الإعدادات (للمدير)
  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { storeName, logoUrl, phone, email, address, facebook, instagram } = req.body;
      const conn = await getConn();
      await conn.execute(
        'UPDATE settings SET storeName=?, logoUrl=?, phone=?, email=?, address=?, facebook=?, instagram=? WHERE id=1',
        [storeName, logoUrl, phone, email, address, facebook, instagram]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
// إعداد رفع الصور
const uploadDir = path.resolve(process.cwd(), "client/public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// مسار رفع الصورة
app.post("/api/upload", upload.single("image"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: "لم يتم استلام الملف" });
  res.json({ url: "/uploads/" + req.file.filename });
});

  
  // بيانات الرسم البياني (آخر 7 أيام)
  app.get("/api/admin/chart-data", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute(`
        SELECT DATE(createdAt) as date, SUM(totalAmount) as total
        FROM store_orders
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `);
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // آخر 5 طلبات
  app.get("/api/admin/recent-orders", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM store_orders ORDER BY createdAt DESC LIMIT 5');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // المنتجات منخفضة المخزون
  app.get("/api/admin/low-stock", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT id, name, stock FROM store_products WHERE stock <= 5 AND active = 1 LIMIT 5');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  app.get("/api/notifications", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 10');
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const { title, message, type } = req.body;
      const conn = await getConn();
      await conn.execute('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)', [title, message, type || 'info']);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب متغيرات منتج معين
  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM product_variants WHERE productId = ?', [req.params.id]);
      await conn.end();
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // إضافة متغير (للمدير)
  app.post("/api/admin/products/:id/variants", async (req, res) => {
    try {
      const { color, size, price, stock } = req.body;
      const conn = await getConn();
      await conn.execute(
        'INSERT INTO product_variants (productId, color, size, price, stock) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = ?, stock = ?',
        [req.params.id, color, size, price, stock, price, stock]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // تقارير المبيعات (آخر 30 يوم)
  app.get("/api/admin/reports/sales", async (req, res) => {
    try {
      const conn = await getConn();
      
      // جلب جميع الطلبات
      const [orders]: any = await conn.execute('SELECT * FROM store_orders ORDER BY createdAt DESC');
      
      // حساب المبيعات اليومية (آخر 30 يوم)
      const dailyMap: any = {};
      const now = new Date();
      
      orders.forEach((o: any) => {
        if (!o.createdAt || o.status === 'cancelled') return;
        const d = new Date(o.createdAt);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 30) {
          const key = d.toISOString().split('T')[0];
          if (!dailyMap[key]) dailyMap[key] = { date: key, total: 0, count: 0 };
          dailyMap[key].total += Number(o.totalAmount) || 0;
          dailyMap[key].count += 1;
        }
      });
      
      const daily = Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
      
      // المنتجات الأكثر مبيعاً (بناءً على تكرار الأسماء)
      const productMap: any = {};
      orders.forEach((o: any) => {
        if (o.status === 'cancelled') return;
        try {
          const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              const name = item.name || item.title || 'منتج';
              if (!productMap[name]) productMap[name] = { names: name, total: 0 };
              productMap[name].total += (Number(item.price) || 0) * (Number(item.quantity) || 1);
            });
          }
        } catch (e) {}
      });
      
      const topProducts = Object.values(productMap)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5);
      
      await conn.end();
      res.json({ daily, topProducts });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // حذف متغير
  app.delete("/api/admin/variants/:id", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      await conn.execute('DELETE FROM product_variants WHERE id = ?', [req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب جميع المنتجات (للإدارة)
  app.get("/api/admin/products", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute('SELECT * FROM store_products ORDER BY createdAt DESC');
      await conn.end();
      const formatted = (rows as any[]).map((p: any) => ({
        id: p.id, name: p.name, category: p.category, description: p.description,
        image: p.imageUrl, images: p.images, price: p.priceHalalas / 100, 
        compareAtHalalas: p.compareAtHalalas, badge: p.badge, material: p.material, rating: p.rating,
        active: p.active
      }));
      res.json(formatted);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب قائمة المفضلة للمستخدم
  app.get("/api/wishlist/:email", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute(
        'SELECT p.* FROM store_products p JOIN wishlists w ON p.id = w.productId WHERE w.userEmail = ?',
        [req.params.email]
      );
      await conn.end();
      const formatted = (rows as any[]).map((p: any) => ({
        id: p.id, name: p.name, category: p.category, image: p.imageUrl, price: p.priceHalalas / 100, compareAtHalalas: p.compareAtHalalas
      }));
      res.json(formatted);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // إضافة منتج للمفضلة
  app.post("/api/wishlist", async (req, res) => {
    try {
      const { userEmail, productId } = req.body;
      const conn = await getConn();
      await conn.execute(
        'INSERT IGNORE INTO wishlists (userEmail, productId) VALUES (?, ?)',
        [userEmail, productId]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // حذف منتج من المفضلة
  app.delete("/api/wishlist/:email/:productId", async (req, res) => {
    try {
      const conn = await getConn();
      await conn.execute(
        'DELETE FROM wishlists WHERE userEmail = ? AND productId = ?',
        [req.params.email, req.params.productId]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب سلة المستخدم
  app.get("/api/cart/:email", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows] = await conn.execute(
        'SELECT c.quantity, c.color, c.size, p.id, p.name, p.category, p.imageUrl, p.priceHalalas, p.compareAtHalalas FROM carts c JOIN store_products p ON p.id = c.productId WHERE c.userEmail = ?',
        [req.params.email]
      );
      await conn.end();
      const formatted = (rows as any[]).map((r: any) => ({
        id: r.id, name: r.name, category: r.category, image: r.imageUrl,
        price: r.priceHalalas / 100, compareAtHalalas: r.compareAtHalalas,
        quantity: r.quantity, size: r.size, color: r.color
      }));
      res.json(formatted);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // إضافة عنصر للسلة
  app.post("/api/cart", async (req, res) => {
    try {
      const { userEmail, productId, quantity, color, size } = req.body;
      const conn = await getConn();
      await conn.execute(
        `INSERT INTO carts (userEmail, productId, quantity, color, size) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [userEmail, productId, quantity, color, size, quantity]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // تحديث كمية عنصر
  app.put("/api/cart/:email/:productId", async (req, res) => {
    try {
      const { quantity } = req.body;
      const conn = await getConn();
      await conn.execute(
        'UPDATE carts SET quantity = ? WHERE userEmail = ? AND productId = ?',
        [quantity, req.params.email, req.params.productId]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // حذف عنصر من السلة
  app.delete("/api/cart/:email/:productId", async (req, res) => {
    try {
      const conn = await getConn();
      await conn.execute(
        'DELETE FROM carts WHERE userEmail = ? AND productId = ?',
        [req.params.email, req.params.productId]
      );
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // جلب تفاصيل طلب معين (للمدير)
  app.get("/api/admin/orders/:id/details", async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.execute('SELECT * FROM store_orders WHERE id = ?', [req.params.id]);
      await conn.end();
      if (rows.length === 0) return res.status(404).json({ error: "الطلب غير موجود" });
      res.json(rows[0]);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  
  // تغيير صلاحية مستخدم (للمدير)
  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      const { role } = req.body;
      const conn = await getConn();
      await conn.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server); else serveStatic(app);
  server.listen(3000, "0.0.0.0", () => console.log("Server listening on port 3000"));
}
startServer().catch(console.error);
