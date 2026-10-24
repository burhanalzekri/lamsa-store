import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { storeOrderItems, storeOrders, storeProducts, storeVariants, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";

export type ProductWrite = {
  name: string;
  category: string;
  description: string;
  material: string;
  imageUrl: string;
  badge: string;
  price: number;
  costPrice: number;
};

export type VariantWrite = { name: string; hex: string; stock: number };
export type OrderLineInput = { productId: string; variantId: string; quantity: number };
export type ShippingInput = { customerName: string; phone: string; city: string; address: string };

function requireDb() {
  return getDb().then(db => {
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حاليًا." });
    return db;
  });
}

function toHalalas(value: number) {
  const amount = Math.round(value * 100);
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "قيمة السعر غير صالحة." });
  }
  return amount;
}

function fromHalalas(value: number) {
  return Number(value) / 100;
}

export async function listProducts(includeInactive = false) {
  const db = await requireDb();
  const productRows = includeInactive
    ? await db.select().from(storeProducts).orderBy(desc(storeProducts.createdAt))
    : await db.select().from(storeProducts).where(eq(storeProducts.active, true)).orderBy(desc(storeProducts.createdAt));
  if (!productRows.length) return [];

  const variantRows = await db.select().from(storeVariants).where(inArray(storeVariants.productId, productRows.map(product => product.id)));
  const byProduct = new Map<string, typeof variantRows>();
  for (const variant of variantRows) {
    const current = byProduct.get(variant.productId) ?? [];
    current.push(variant);
    byProduct.set(variant.productId, current);
  }

  return productRows.map(product => {
    const base = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description ?? "",
      material: product.material ?? "",
      image: product.imageUrl ?? "",
      badge: product.badge ?? undefined,
      price: fromHalalas(product.priceHalalas),
      colors: (byProduct.get(product.id) ?? []).map(variant => ({
        id: variant.id,
        name: variant.name,
        hex: variant.hex,
        stock: variant.stock,
      })),
    };
    return includeInactive
      ? { ...base, costPrice: fromHalalas(product.costHalalas), active: product.active }
      : base;
  });
}

export async function createProduct(input: ProductWrite & { colors: VariantWrite[] }) {
  const db = await requireDb();
  const productId = nanoid(16);
  await db.transaction(async tx => {
    await tx.insert(storeProducts).values({
      id: productId,
      name: input.name.trim(),
      category: input.category.trim(),
      description: input.description.trim() || null,
      material: input.material.trim() || null,
      imageUrl: input.imageUrl.trim() || null,
      badge: input.badge.trim() || null,
      priceHalalas: toHalalas(input.price),
      compareAtHalalas: input.compareAtPrice ? toHalalas(input.compareAtPrice) : null,
      badge: input.badge || null,
      costHalalas: toHalalas(input.costPrice),
      active: true,
    });
    await tx.insert(storeVariants).values(input.colors.map(color => ({
      id: nanoid(16),
      productId,
      name: color.name.trim(),
      hex: color.hex.toLowerCase(),
      stock: color.stock,
    })));
  });
  return { id: productId };
}

export async function updateProduct(input: ProductWrite & { id: string }) {
  const db = await requireDb();
  const result = await db.update(storeProducts).set({
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description.trim() || null,
    material: input.material.trim() || null,
    imageUrl: input.imageUrl.trim() || null,
    badge: input.badge.trim() || null,
    priceHalalas: toHalalas(input.price),
    costHalalas: toHalalas(input.costPrice),
    updatedAt: new Date(),
  }).where(eq(storeProducts.id, input.id));
  const updateResult = Array.isArray(result) ? result[0] : result;
  const affected = Number((updateResult as { affectedRows?: number; rowsAffected?: number }).affectedRows ?? (updateResult as { rowsAffected?: number }).rowsAffected ?? 0);
  if (affected < 1) {
    throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود." });
  }
  return { success: true };
}

export async function setProductActive(id: string, active: boolean) {
  const db = await requireDb();
  await db.update(storeProducts).set({ active, updatedAt: new Date() }).where(eq(storeProducts.id, id));
  return { success: true };
}

export async function addVariant(productId: string, input: VariantWrite) {
  const db = await requireDb();
  const [product] = await db.select({ id: storeProducts.id }).from(storeProducts).where(eq(storeProducts.id, productId)).limit(1);
  if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود." });
  const id = nanoid(16);
  await db.insert(storeVariants).values({ id, productId, name: input.name.trim(), hex: input.hex.toLowerCase(), stock: input.stock });
  return { id };
}

export async function setVariantStock(variantId: string, stock: number) {
  const db = await requireDb();
  const result = await db.update(storeVariants).set({ stock, updatedAt: new Date() }).where(eq(storeVariants.id, variantId));
  const updateResult = Array.isArray(result) ? result[0] : result;
  const affected = Number((updateResult as { affectedRows?: number; rowsAffected?: number }).affectedRows ?? (updateResult as { rowsAffected?: number }).rowsAffected ?? 0);
  if (affected < 1) {
    throw new TRPCError({ code: "NOT_FOUND", message: "متغير اللون غير موجود." });
  }
  return { success: true };
}

export async function placeOrder(userId: number, shipping: ShippingInput, inputLines: OrderLineInput[]) {
  const db = await requireDb();
  const consolidated = new Map<string, OrderLineInput>();
  for (const line of inputLines) {
    const previous = consolidated.get(line.variantId);
    if (previous && previous.productId !== line.productId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "بيانات أحد المنتجات غير متطابقة." });
    }
    consolidated.set(line.variantId, {
      ...line,
      quantity: line.quantity + (previous?.quantity ?? 0),
    });
  }

  if (!consolidated.size || consolidated.size > 30) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "الحقيبة فارغة أو تحتوي عناصر كثيرة جدًا." });
  }

  const orderId = nanoid(16);
  const orderNumber = `LM-${nanoid(8).toUpperCase()}`;
  return db.transaction(async tx => {
    const checkedItems: Array<{
      productId: string;
      variantId: string;
      productName: string;
      colorName: string;
      unitPriceHalalas: number;
      unitCostHalalas: number;
      quantity: number;
    }> = [];
    let subtotalHalalas = 0;

    for (const line of consolidated.values()) {
      const rows = await tx.select({
        productId: storeProducts.id,
        productName: storeProducts.name,
        active: storeProducts.active,
        priceHalalas: storeProducts.priceHalalas,
        costHalalas: storeProducts.costHalalas,
        variantId: storeVariants.id,
        colorName: storeVariants.name,
        stock: storeVariants.stock,
      }).from(storeVariants)
        .innerJoin(storeProducts, eq(storeProducts.id, storeVariants.productId))
        .where(eq(storeVariants.id, line.variantId))
        .for("update")
        .limit(1);
      const item = rows[0];
      if (!item || item.productId !== line.productId || !item.active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "أحد المنتجات لم يعد متاحًا. حدّثي الحقيبة وحاولي مجددًا." });
      }
      if (item.stock < line.quantity) {
        throw new TRPCError({ code: "CONFLICT", message: `المتاح من لون ${item.colorName} هو ${item.stock} فقط.` });
      }

      await tx.update(storeVariants).set({ stock: item.stock - line.quantity, updatedAt: new Date() }).where(eq(storeVariants.id, item.variantId));
      subtotalHalalas += item.priceHalalas * line.quantity;
      checkedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        colorName: item.colorName,
        unitPriceHalalas: item.priceHalalas,
        unitCostHalalas: item.costHalalas,
        quantity: line.quantity,
      });
    }

    await tx.insert(storeOrders).values({
      id: orderId,
      orderNumber,
      userId,
      customerName: shipping.customerName.trim(),
      phone: shipping.phone.trim(),
      city: shipping.city.trim(),
      address: shipping.address.trim(),
      status: "pending",
      paymentStatus: "unpaid",
      subtotalHalalas,
      shippingHalalas: 0,
      totalHalalas: subtotalHalalas,
    });
    await tx.insert(storeOrderItems).values(checkedItems.map(item => ({ orderId, ...item })));

    return { id: orderId, orderNumber, total: fromHalalas(subtotalHalalas) };
  });
}

export async function listAdminOrders() {
  const db = await requireDb();
  const rows = await db.select({
    id: storeOrders.id,
    orderNumber: storeOrders.orderNumber,
    userId: storeOrders.userId,
    customerName: storeOrders.customerName,
    phone: storeOrders.phone,
    city: storeOrders.city,
    address: storeOrders.address,
    status: storeOrders.status,
    paymentStatus: storeOrders.paymentStatus,
    subtotalHalalas: storeOrders.subtotalHalalas,
    totalHalalas: storeOrders.totalHalalas,
    createdAt: storeOrders.createdAt,
  }).from(storeOrders).orderBy(desc(storeOrders.createdAt)).limit(300);
  if (!rows.length) return [];
  const itemCounts = await db.select({ orderId: storeOrderItems.orderId, quantity: sql<number>`sum(${storeOrderItems.quantity})` })
    .from(storeOrderItems).where(inArray(storeOrderItems.orderId, rows.map(row => row.id))).groupBy(storeOrderItems.orderId);
  const countByOrder = new Map(itemCounts.map(row => [row.orderId, Number(row.quantity ?? 0)]));
  return rows.map(row => ({
    ...row,
    items: countByOrder.get(row.id) ?? 0,
    subtotal: fromHalalas(row.subtotalHalalas),
    total: fromHalalas(row.totalHalalas),
  }));
}

export async function updateOrderStatus(orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await requireDb();
  return db.transaction(async tx => {
    const [order] = await tx.select().from(storeOrders).where(eq(storeOrders.id, orderId)).for("update").limit(1);
    if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود." });
    if (order.status === "cancelled" && status !== "cancelled") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إعادة فتح طلب ملغي." });
    }
    if (order.status !== "cancelled" && status === "cancelled") {
      const lines = await tx.select({ variantId: storeOrderItems.variantId, quantity: storeOrderItems.quantity })
        .from(storeOrderItems).where(eq(storeOrderItems.orderId, orderId));
      for (const line of lines) {
        await tx.update(storeVariants)
          .set({ stock: sql`${storeVariants.stock} + ${line.quantity}`, updatedAt: new Date() })
          .where(eq(storeVariants.id, line.variantId));
      }
    }
    await tx.update(storeOrders).set({ status, updatedAt: new Date() }).where(eq(storeOrders.id, orderId));
    return { success: true };
  });
}

export async function updatePaymentStatus(orderId: string, paymentStatus: "unpaid" | "paid" | "refunded") {
  const db = await requireDb();
  const [order] = await db.select({ status: storeOrders.status, paymentStatus: storeOrders.paymentStatus })
    .from(storeOrders).where(eq(storeOrders.id, orderId)).limit(1);
  if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود." });
  if (order.status === "cancelled" && paymentStatus === "paid") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن تسجيل الدفع لطلب ملغي." });
  }
  if (order.paymentStatus === "refunded" && paymentStatus !== "refunded") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "حالة الاسترداد نهائية في هذه النسخة." });
  }
  await db.update(storeOrders).set({
    paymentStatus,
    paidAt: paymentStatus === "paid" ? new Date() : paymentStatus === "unpaid" ? null : undefined,
    updatedAt: new Date(),
  }).where(eq(storeOrders.id, orderId));
  return { success: true };
}

export async function listUsers() {
  const db = await requireDb();
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    loginMethod: users.loginMethod,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.lastSignedIn)).limit(500);
}

export async function setUserRole(userId: number, role: "user" | "admin", actorId: number) {
  if (userId === actorId) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكنك تغيير صلاحية حسابك الحالي." });
  const db = await requireDb();
  return db.transaction(async tx => {
    const [target] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود." });
    const configuredAdmin = Boolean(ENV.initialAdminEmail && target.email?.trim().toLowerCase() === ENV.initialAdminEmail);
    const configuredOwner = Boolean(ENV.ownerOpenId && target.openId === ENV.ownerOpenId);
    if (role === "user" && (configuredAdmin || configuredOwner)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن سحب صلاحية المشرف الأول المعيّن للمشروع." });
    }
    if (target.role === "admin" && role === "user") {
      const rows = await tx.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "admin"));
      if (Number(rows[0]?.count ?? 0) <= 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "يجب أن يبقى في المتجر مشرف واحد على الأقل." });
      }
    }
    await tx.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
    return { success: true };
  });
}

export async function adminOverview() {
  const db = await requireDb();
  const [productRows, variantRows, orderRows, userRows] = await Promise.all([
    db.select({ id: storeProducts.id }).from(storeProducts).where(eq(storeProducts.active, true)),
    db.select({ stock: storeVariants.stock }).from(storeVariants),
    db.select({ status: storeOrders.status, paymentStatus: storeOrders.paymentStatus }).from(storeOrders),
    db.select({ id: users.id }).from(users),
  ]);
  return {
    activeProducts: productRows.length,
    stockUnits: variantRows.reduce((total, item) => total + item.stock, 0),
    lowStockVariants: variantRows.filter(item => item.stock <= 3).length,
    outOfStockVariants: variantRows.filter(item => item.stock === 0).length,
    openOrders: orderRows.filter(order => order.status === "pending" || order.status === "processing").length,
    unpaidOrders: orderRows.filter(order => order.paymentStatus === "unpaid").length,
    users: userRows.length,
  };
}

export async function monthlySalesReport(year: number, month: number) {
  const db = await requireDb();
  // The storefront currency is SAR; calendar cutoffs use Asia/Riyadh (UTC+03:00, no DST).
  const start = new Date(Date.UTC(year, month - 1, 1) - 3 * 60 * 60 * 1000);
  const end = new Date(Date.UTC(year, month, 1) - 3 * 60 * 60 * 1000);
  const rows = await db.select({
    orderId: storeOrders.id,
    paidAt: storeOrders.paidAt,
    unitPriceHalalas: storeOrderItems.unitPriceHalalas,
    unitCostHalalas: storeOrderItems.unitCostHalalas,
    quantity: storeOrderItems.quantity,
  }).from(storeOrders)
    .innerJoin(storeOrderItems, eq(storeOrderItems.orderId, storeOrders.id))
    .where(and(
      eq(storeOrders.paymentStatus, "paid"),
      ne(storeOrders.status, "cancelled"),
      gte(storeOrders.paidAt, start),
      lt(storeOrders.paidAt, end),
    ));

  const orderIds = new Set<string>();
  let revenueHalalas = 0;
  let costHalalas = 0;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const daily = Array.from({ length: daysInMonth }, (_, index) => ({ day: index + 1, revenueHalalas: 0, profitHalalas: 0 }));
  for (const row of rows) {
    orderIds.add(row.orderId);
    const revenue = row.unitPriceHalalas * row.quantity;
    const cost = row.unitCostHalalas * row.quantity;
    revenueHalalas += revenue;
    costHalalas += cost;
    const dayInRiyadh = row.paidAt ? new Date(new Date(row.paidAt).getTime() + 3 * 60 * 60 * 1000).getUTCDate() : 0;
    if (daily[dayInRiyadh - 1]) {
      daily[dayInRiyadh - 1].revenueHalalas += revenue;
      daily[dayInRiyadh - 1].profitHalalas += revenue - cost;
    }
  }
  const profitHalalas = revenueHalalas - costHalalas;
  return {
    year,
    month,
    paidOrders: orderIds.size,
    revenue: fromHalalas(revenueHalalas),
    costOfGoods: fromHalalas(costHalalas),
    grossProfit: fromHalalas(profitHalalas),
    marginPercent: revenueHalalas ? Math.round((profitHalalas / revenueHalalas) * 10000) / 100 : 0,
    daily: daily.map(item => ({
      day: item.day,
      revenue: fromHalalas(item.revenueHalalas),
      grossProfit: fromHalalas(item.profitHalalas),
    })),
  };
}
