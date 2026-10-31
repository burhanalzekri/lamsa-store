import jwt from 'jsonwebtoken';
import express from "express";

export function registerAdminRoutes(app: express.Express, getConn: () => Promise<any>) {
  // Middleware: التحقق من أن المستخدم مدير
  const requireAdmin = (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'مطلوب تسجيل الدخول' });
      }
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || "lamsa_secret_2026";
      const decoded: any = jwt.verify(token, secret);
      
      // نتحقق من الدور (admin) فقط — تم إزالة البريد الثابت لأسباب أمنية
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'غير مصرح لك بالوصول' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'رمز الدخول غير صالح' });
    }
  };

  // 1. جلب المنتجات
  
  app.put("/api/admin/settings", express.json(), requireAdmin, async (req, res) => {
    try {
      const { storeName, currency, phone, email, address, facebook, instagram } = req.body;
      const conn = await getConn();
      
      // التحقق من وجود صف في جدول الإعدادات
      const [rows]: any = await conn.query("SELECT id FROM settings LIMIT 1");
      if (rows.length === 0) {
        await conn.execute(
          "INSERT INTO settings (id, storeName, currency, phone, email, address, facebook, instagram) VALUES (1, ?, ?, ?, ?, ?, ?, ?)",
          [storeName, currency, phone, email, address, facebook, instagram]
        );
      } else {
        await conn.execute(
          "UPDATE settings SET storeName=?, currency=?, phone=?, email=?, address=?, facebook=?, instagram=? WHERE id=1",
          [storeName, currency, phone, email, address, facebook, instagram]
        );
      }
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  
  // إضافة فئة
  app.post("/api/admin/categories/new", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { name } = req.body;
      const conn = await getConn();
      await conn.execute("INSERT INTO categories (name) VALUES (?)", [name]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // تعديل فئة
  app.put("/api/admin/categories/:id/update", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { name } = req.body;
      const conn = await getConn();
      await conn.execute("UPDATE categories SET name=? WHERE id=?", [name, req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // حذف فئة
  app.delete("/api/admin/categories/:id/delete", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      await conn.execute("DELETE FROM categories WHERE id=?", [req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/categories", async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query("SELECT * FROM categories ORDER BY name ASC");
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  // تقارير حقيقية
  app.get("/api/admin/reports", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const days = Number(req.query.days) || 30;
      
      // 1. الإحصائيات الأساسية للفترة الحالية
      const [totals]: any = await conn.query(`
        SELECT COUNT(*) as orderCount, 
               COALESCE(SUM(totalAmount), 0) as revenue 
        FROM store_orders 
        WHERE status != 'cancelled' 
          AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [days]);
      
      const avgOrder = totals[0].orderCount > 0 ? (totals[0].revenue / totals[0].orderCount) : 0;

      // 2. الإحصائيات للفترة السابقة (لحساب النمو)
      const [prevTotals]: any = await conn.query(`
        SELECT COUNT(*) as orderCount, COALESCE(SUM(totalAmount), 0) as revenue 
        FROM store_orders 
        WHERE status != 'cancelled' 
          AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
          AND createdAt < DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [days * 2, days]);
      
      const prevRevenue = prevTotals[0].revenue;
      const growth = prevRevenue > 0 ? ((totals[0].revenue - prevRevenue) / prevRevenue) * 100 : 0;

      // 3. المبيعات اليومية
      const [dailySales]: any = await conn.query(`
        SELECT DATE(createdAt) as date, SUM(totalAmount) as total 
        FROM store_orders 
        WHERE status != 'cancelled' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(createdAt) 
        ORDER BY date ASC
      `, [days]);

      // 4. توزيع المبيعات حسب الفئة
      // توزيع المبيعات حسب الفئة (بديل آمن لـ JSON_TABLE)
      const [rawOrders]: any = await conn.query(`
        SELECT o.items, o.totalAmount FROM store_orders o
        WHERE o.status != 'cancelled' AND o.createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      `, [days]);
      
      const [allProducts]: any = await conn.query("SELECT id, category FROM store_products");
      const categoryMap: { [cat: string]: number } = {};
      
      for (const o of rawOrders) {
        try {
          const items = JSON.parse(o.items || '[]');
          for (const item of items) {
            const product = allProducts.find((p: any) => p.id === item.id);
            const cat = product ? product.category : 'أخرى';
            categoryMap[cat] = (categoryMap[cat] || 0) + (Number(o.totalAmount) || 0);
          }
        } catch (e) {}
      }
      
      const categorySales = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));

      // 5. العملاء الأكثر إنفاقاً
      const [topCustomers]: any = await conn.query(`
        SELECT customerName, phone, COUNT(*) as orderCount, SUM(totalAmount) as totalSpent 
        FROM store_orders 
        WHERE status != 'cancelled' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY customerName, phone
        ORDER BY totalSpent DESC 
        LIMIT 5
      `, [days]);

      // 6. المنتجات الأكثر مبيعاً + صافي الربح
      const [products]: any = await conn.query("SELECT id, name, imageUrl, stock, priceHalalas, costHalalas FROM store_products");
      const [allOrders]: any = await conn.query("SELECT items, createdAt FROM store_orders WHERE status != 'cancelled' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)", [days]);
      
      const productSales: any = {};
      for (const order of allOrders) {
        try {
          const items = JSON.parse(order.items || '[]');
          for (const item of items) {
            if (!item.id) continue;
            if (!productSales[item.id]) {
              productSales[item.id] = { name: item.name || 'منتج محذوف', count: 0, revenue: 0, lastSold: null };
            }
            productSales[item.id].count += (item.quantity || 1);
            productSales[item.id].revenue += ((item.price || 0) * (item.quantity || 1));
            const orderDate = new Date(order.createdAt);
            if (!productSales[item.id].lastSold || orderDate > productSales[item.id].lastSold) {
              productSales[item.id].lastSold = orderDate;
            }
          }
        } catch (e) {}
      }

      const topProducts = Object.entries(productSales)
        .map(([id, data]: any) => {
          const product = products.find((p: any) => p.id === id);
          const cost = product ? (product.costHalalas || 0) : 0;
          const profit = data.revenue - (cost * data.count);
          return { id, ...data, profit };
        })
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);

      // 7. المنتجات الراكدة
      const now = new Date();
      const cutoffDate = new Date(now.setDate(now.getDate() - days));
      const stagnantProducts = products.filter((p: any) => {
        const sale = productSales[p.id];
        if (!sale || sale.count === 0) return true;
        if (sale.lastSold && new Date(sale.lastSold) < cutoffDate) return true;
        return false;
      }).map((p: any) => ({
        id: p.id, name: p.name, stock: p.stock || 0,
        lastSold: productSales[p.id]?.lastSold || null
      })).slice(0, 10);

      // 8. توصيات إعادة الطلب
      const reorderRecommendations = [];
      for (const [id, sale] of Object.entries(productSales)) {
        const product = products.find((p: any) => p.id === id);
        if (!product || !product.stock || product.stock <= 0) continue;
        const dailyRate = (sale as any).count / days;
        if (dailyRate > 0) {
          const daysLeft = Math.floor(product.stock / dailyRate);
          if (daysLeft <= 14) {
            reorderRecommendations.push({
              id, name: product.name, stock: product.stock, daysLeft, dailyRate: dailyRate.toFixed(1)
            });
          }
        }
      }

      // 9. صافي الأرباح الإجمالي
      let totalProfit = 0;
      for (const p of topProducts as any[]) {
        totalProfit += p.profit;
      }

      await conn.end();
      
      res.json({
        totals: { orders: totals[0].orderCount, revenue: totals[0].revenue, avgOrder, growth, profit: totalProfit },
        dailySales,
        categorySales,
        topCustomers,
        topProducts,
        stagnantProducts,
        reorderRecommendations: reorderRecommendations.sort((a, b) => a.daysLeft - b.daysLeft)
      });
    } catch (err: any) { 
      console.error("Reports error:", err);
      res.status(500).json({ error: err.message }); 
    }
  });

  
  // جلب كل الكوبونات
  app.get("/api/admin/coupons", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query("SELECT * FROM coupons ORDER BY createdAt DESC");
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // إضافة كوبون
  app.post("/api/admin/coupons/new", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { code, discountPercent, active } = req.body;
      const conn = await getConn();
      await conn.execute("INSERT INTO coupons (code, discountPercent, active) VALUES (?, ?, ?)", [code, discountPercent, active ? 1 : 0]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // تعديل كوبون
  app.put("/api/admin/coupons/:id/update", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { code, discountPercent, active } = req.body;
      const conn = await getConn();
      await conn.execute("UPDATE coupons SET code=?, discountPercent=?, active=? WHERE id=?", [code, discountPercent, active ? 1 : 0, req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // حذف كوبون
  app.delete("/api/admin/coupons/:id/delete", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      await conn.execute("DELETE FROM coupons WHERE id=?", [req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // سجل استخدام الكوبونات (من الطلبات)
  app.get("/api/admin/coupons/history", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query(`
        SELECT o.id, o.orderNumber, o.customerName, o.totalAmount, o.createdAt, o.items
        FROM store_orders o
        WHERE o.status != 'cancelled' AND o.items LIKE '%coupon%'
        ORDER BY o.createdAt DESC LIMIT 50
      `);
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  // جلب طلبات المستخدم الحالي (حسب البريد أو الهاتف)
  app.get("/api/my-orders", async (req: any, res: any) => {
    try {
      const email = req.query.email;
      if (!email) return res.status(400).json({ error: "البريد مطلوب" });
      const conn = await getConn();
      const [rows]: any = await conn.query(
        'SELECT * FROM store_orders WHERE customerEmail = ? ORDER BY createdAt DESC',
        [email]
      );
      await conn.end();
      res.json(Array.isArray(rows) ? rows : []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  // تطبيق خصم على منتج
  app.post("/api/admin/products/:id/discount", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { discountPercent, endsAt } = req.body;
      
      if (!discountPercent || discountPercent < 1 || discountPercent > 99) {
        return res.status(400).json({ error: "نسبة الخصم يجب أن تكون بين 1 و 99" });
      }
      
      const conn = await getConn();
      
      // جلب السعر الأصلي (قبل الخصم)
      const [rows]: any = await conn.query('SELECT priceHalalas, compareAtHalalas FROM store_products WHERE id = ?', [id]);
      if (rows.length === 0) {
        await conn.end();
        return res.status(404).json({ error: "المنتج غير موجود" });
      }
      
      const product = rows[0];
      // السعر الأصلي: إذا كان compareAtHalalas موجوداً، نستخدمه. وإلا نستخدم السعر الحالي.
      const originalPrice = product.compareAtHalalas > 0 ? product.compareAtHalalas : product.priceHalalas;
      const newPrice = Math.round(originalPrice * (1 - discountPercent / 100));
      
      // تاريخ الانتهاء (إذا لم يُحدد، ينتهي بعد 30 يوم)
      const endsAtDate = endsAt ? new Date(endsAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await conn.execute(
        'UPDATE store_products SET priceHalalas = ?, compareAtHalalas = ?, discountEndsAt = ? WHERE id = ?',
        [newPrice, originalPrice, endsAtDate, id]
      );
      
      await conn.end();
      res.json({ 
        success: true, 
        originalPrice: originalPrice / 100,
        newPrice: newPrice / 100,
        discountPercent,
        endsAt: endsAtDate
      });
    } catch (err: any) { 
      console.error('Discount error:', err);
      res.status(500).json({ error: err.message }); 
    }
  });

  // إزالة الخصم من منتج
  app.delete("/api/admin/products/:id/discount", requireAdmin, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const conn = await getConn();
      await conn.execute(
        'UPDATE store_products SET priceHalalas = compareAtHalalas, compareAtHalalas = 0, discountEndsAt = NULL WHERE id = ?',
        [id]
      );
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { 
      res.status(500).json({ error: err.message }); 
    }
  });

  
  // جلب المنتجات المخفضة
  app.get("/api/admin/discounts", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query(
        'SELECT id, name, imageUrl, priceHalalas, compareAtHalalas, discountEndsAt FROM store_products WHERE compareAtHalalas > 0 AND compareAtHalalas > priceHalalas ORDER BY discountEndsAt ASC'
      );
      await conn.end();
      res.json(Array.isArray(rows) ? rows : []);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  // تقرير المخزون
  app.get("/api/admin/inventory-report", requireAdmin, async (req: any, res: any) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query(`
        SELECT 
          id, name, category, stock, priceHalalas, costHalalas, 
          (stock * priceHalalas) as totalValue,
          (stock * costHalalas) as totalCost,
          active
        FROM store_products 
        ORDER BY stock ASC, name ASC
      `);
      await conn.end();
      
      const totalValue = rows.reduce((s: number, r: any) => s + Number(r.totalValue || 0), 0);
      const totalCost = rows.reduce((s: number, r: any) => s + Number(r.totalCost || 0), 0);
      const outOfStock = rows.filter((r: any) => r.stock === 0).length;
      const lowStock = rows.filter((r: any) => r.stock > 0 && r.stock <= 5).length;
      
      res.json({
        products: rows,
        summary: {
          totalProducts: rows.length,
          totalValue: totalValue / 100,
          totalCost: totalCost / 100,
          outOfStock,
          lowStock,
          expectedProfit: (totalValue - totalCost) / 100
        }
      });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  
  // استيراد منتجات بالجملة من Excel
  app.post("/api/admin/products/bulk", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "لا توجد منتجات للاستيراد" });
      }

      const conn = await getConn();
      let imported = 0;
      const errors: any[] = [];

      for (const p of products) {
        try {
          const id = "p_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
          await conn.execute(
            `INSERT INTO store_products 
             (id, name, category, description, imageUrl, priceHalalas, compareAtHalalas, stock, badge, material, active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              id,
              p.name || 'بدون اسم',
              p.category || 'عام',
              p.description || null,
              p.imageUrl || null,
              Math.round(Number(p.price) * 100) || 0,
              Math.round(Number(p.compareAtPrice || 0) * 100) || 0,
              Number(p.stock) || 0,
              p.badge || null,
              p.material || null,
            ]
          );
          imported++;
        } catch (e: any) {
          errors.push({ name: p.name, error: e.message });
        }
      }

      await conn.end();
      res.json({ success: true, imported, errors });
    } catch (err: any) {
      console.error('Bulk import error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/all-products", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query("SELECT * FROM store_products ORDER BY createdAt DESC");
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 2. إضافة منتج
  app.post("/api/admin/products/new", express.json(), requireAdmin, async (req, res) => {
    try {
      const { name, price, compareAtPrice, stock, category, imageUrl, images, badge, description, material } = req.body;
      const id = "p_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      const conn = await getConn();
      await conn.execute(
        `INSERT INTO store_products 
         (id, name, category, description, imageUrl, images, priceHalalas, compareAtHalalas, badge, material, stock, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [id, name || 'بدون اسم', category || 'عام', description || null, imageUrl || null, images || null, Math.round(Number(price) || 0), Math.round(Number(compareAtPrice) || 0), badge || null, material || null, Number(stock) || 0]
      );
      await conn.end();
      res.json({ success: true, id });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 3. تعديل منتج
  app.put("/api/admin/products/:id/update", express.json(), requireAdmin, async (req, res) => {
    try {
      const { name, price, compareAtPrice, stock, category, imageUrl, images, badge, description, material } = req.body;
      const conn = await getConn();
      await conn.execute(
        `UPDATE store_products SET 
         name=?, category=?, description=?, imageUrl=?, images=?, priceHalalas=?, compareAtHalalas=?, badge=?, material=?, stock=? 
         WHERE id=?`,
        [name, category, description || null, imageUrl || null, images || null, Math.round(Number(price) || 0), Math.round(Number(compareAtPrice) || 0), badge || null, material || null, Number(stock) || 0, req.params.id]
      );
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 4. حذف منتج
  app.delete("/api/admin/products/:id/delete", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      await conn.execute("DELETE FROM store_products WHERE id=?", [req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 5. جلب الطلبات
  app.get("/api/admin/all-orders", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query("SELECT * FROM store_orders ORDER BY createdAt DESC LIMIT 100");
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 6. تحديث حالة الطلب
  app.put("/api/admin/orders/:id/status", express.json(), requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      await conn.execute("UPDATE store_orders SET status=? WHERE id=?", [req.body.status, req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 7. جلب المستخدمين
  
  // تغيير دور المستخدم (ترقية/إلغاء مدير)
  app.put("/api/admin/users/:id/role", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { role } = req.body;
      if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: "دور غير صالح" });
      const conn = await getConn();
      await conn.execute("UPDATE users SET role=? WHERE id=?", [role, req.params.id]);
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // إضافة مستخدم جديد (مدير)
  app.post("/api/admin/users/new", express.json(), requireAdmin, async (req: any, res: any) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: "الاسم والبريد وكلمة المرور مطلوبة" });
      
      const hashedPassword = await Promise.resolve("");
      
      const conn = await getConn();
      const [existing]: any = await conn.query("SELECT id FROM users WHERE email=?", [email]);
      if (existing.length > 0) return res.status(400).json({ error: "البريد مستخدم بالفعل" });
      
      await conn.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role || 'admin']
      );
      await conn.end();
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/admin/all-users", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [rows]: any = await conn.query("SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC");
      await conn.end();
      res.json(Array.isArray(rows) ? rows : (rows.rows || []));
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // 8. الإحصائيات
  app.get("/api/admin/stats-new", requireAdmin, async (req, res) => {
    try {
      const conn = await getConn();
      const [products]: any = await conn.query("SELECT COUNT(*) as c FROM store_products WHERE active=1");
      const [orders]: any = await conn.query("SELECT COUNT(*) as c FROM store_orders");
      const [users]: any = await conn.query("SELECT COUNT(*) as c FROM users");
      const [revenue]: any = await conn.query("SELECT COALESCE(SUM(totalAmount), 0) as s FROM store_orders WHERE status != 'cancelled'");
      await conn.end();
      
      const pCount = Array.isArray(products) ? products[0].c : products.c;
      const oCount = Array.isArray(orders) ? orders[0].c : orders.c;
      const uCount = Array.isArray(users) ? users[0].c : users.c;
      const rSum = Array.isArray(revenue) ? revenue[0].s : revenue.s;

      res.json({ products: pCount, orders: oCount, users: uCount, revenue: rSum });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  console.log("✅ تم تسجيل 8 مسارات لوحة التحكم");
}
