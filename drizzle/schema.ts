import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Persisted Manus OAuth accounts. The project owner/admin role is application data. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const storeProducts = mysqlTable("store_products", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 220 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  material: varchar("material", { length: 180 }),
  imageUrl: text("imageUrl"),
  badge: varchar("badge", { length: 80 }),
  priceHalalas: int("priceHalalas").notNull(),
  costHalalas: int("costHalalas").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("store_products_active_created_idx").on(table.active, table.createdAt)]);

export const storeVariants = mysqlTable("store_product_variants", {
  id: varchar("id", { length: 32 }).primaryKey(),
  productId: varchar("productId", { length: 32 }).notNull().references(() => storeProducts.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 80 }).notNull(),
  hex: varchar("hex", { length: 16 }).notNull(),
  stock: int("stock").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("store_variant_product_color_unique").on(table.productId, table.name),
  index("store_variants_product_idx").on(table.productId),
]);

export const storeOrders = mysqlTable("store_orders", {
  id: varchar("id", { length: 32 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "restrict" }),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  address: text("address").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  subtotalHalalas: int("subtotalHalalas").notNull(),
  shippingHalalas: int("shippingHalalas").default(0).notNull(),
  totalHalalas: int("totalHalalas").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("store_orders_user_created_idx").on(table.userId, table.createdAt),
  index("store_orders_payment_created_idx").on(table.paymentStatus, table.createdAt),
]);

export const storeOrderItems = mysqlTable("store_order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 32 }).notNull().references(() => storeOrders.id, { onDelete: "cascade" }),
  productId: varchar("productId", { length: 32 }).notNull().references(() => storeProducts.id, { onDelete: "restrict" }),
  variantId: varchar("variantId", { length: 32 }).notNull().references(() => storeVariants.id, { onDelete: "restrict" }),
  productName: varchar("productName", { length: 220 }).notNull(),
  colorName: varchar("colorName", { length: 80 }).notNull(),
  unitPriceHalalas: int("unitPriceHalalas").notNull(),
  unitCostHalalas: int("unitCostHalalas").notNull(),
  quantity: int("quantity").notNull(),
}, table => [index("store_order_items_order_idx").on(table.orderId)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type StoreProduct = typeof storeProducts.$inferSelect;
export type StoreVariant = typeof storeVariants.$inferSelect;
export type StoreOrder = typeof storeOrders.$inferSelect;
export type StoreOrderItem = typeof storeOrderItems.$inferSelect;
