import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as storeDb from "./store-db";

const productFields = z.object({
  name: z.string().trim().min(2).max(220),
  category: z.string().trim().min(1).max(100),
  description: z.string().max(5000).default(""),
  material: z.string().max(180).default(""),
  imageUrl: z.string().trim().max(2048).default("").refine(value => !value || value.startsWith("/manus-storage/") || /^https:\/\//i.test(value), "استخدمي رابط صورة HTTPS أو مسار تخزين المتجر."),
  badge: z.string().max(80).default(""),
  price: z.number().finite().min(0.01).max(100000),
  costPrice: z.number().finite().min(0).max(100000),
});

const variantFields = z.object({
  name: z.string().trim().min(1).max(80),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  stock: z.number().int().min(0).max(1000000),
});

const orderLineFields = z.object({
  productId: z.string().min(1).max(32),
  variantId: z.string().min(1).max(32),
  quantity: z.number().int().min(1).max(100),
});

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
const paymentStatuses = ["unpaid", "paid", "refunded"] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ? ({
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      loginMethod: ctx.user.loginMethod,
      role: ctx.user.role,
    }) : null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  store: router({
    products: publicProcedure.query(() => storeDb.listProducts(false)),
    placeOrder: protectedProcedure.input(z.object({
      shipping: z.object({
        customerName: z.string().trim().min(2).max(180),
        phone: z.string().trim().min(7).max(40),
        city: z.string().trim().min(2).max(120),
        address: z.string().trim().min(5).max(2000),
      }),
      items: z.array(orderLineFields).min(1).max(30),
    })).mutation(({ ctx, input }) => storeDb.placeOrder(ctx.user.id, input.shipping, input.items)),
  }),

  admin: router({
    overview: adminProcedure.query(() => storeDb.adminOverview()),
    products: adminProcedure.query(async () => (await storeDb.listProducts(true)).map(product => ({
      ...product,
      costPrice: "costPrice" in product ? product.costPrice : 0,
      active: "active" in product ? product.active : true,
    }))),
    productsCreate: adminProcedure.input(productFields.extend({ colors: z.array(variantFields).min(1).max(24) }))
      .mutation(({ input }) => storeDb.createProduct(input)),
    productsUpdate: adminProcedure.input(productFields.extend({ id: z.string().min(1).max(32) }))
      .mutation(({ input }) => storeDb.updateProduct(input)),
    productsSetActive: adminProcedure.input(z.object({ id: z.string().min(1).max(32), active: z.boolean() }))
      .mutation(({ input }) => storeDb.setProductActive(input.id, input.active)),
    inventory: router({
      addVariant: adminProcedure.input(z.object({ productId: z.string().min(1).max(32), variant: variantFields }))
        .mutation(({ input }) => storeDb.addVariant(input.productId, input.variant)),
      setStock: adminProcedure.input(z.object({ variantId: z.string().min(1).max(32), stock: z.number().int().min(0).max(1000000) }))
        .mutation(({ input }) => storeDb.setVariantStock(input.variantId, input.stock)),
    }),
    orders: router({
      list: adminProcedure.query(() => storeDb.listAdminOrders()),
      setStatus: adminProcedure.input(z.object({ orderId: z.string().min(1).max(32), status: z.enum(orderStatuses) }))
        .mutation(({ input }) => storeDb.updateOrderStatus(input.orderId, input.status)),
      setPaymentStatus: adminProcedure.input(z.object({ orderId: z.string().min(1).max(32), paymentStatus: z.enum(paymentStatuses) }))
        .mutation(({ input }) => storeDb.updatePaymentStatus(input.orderId, input.paymentStatus)),
    }),
    users: router({
      list: adminProcedure.query(() => storeDb.listUsers()),
      setRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
        .mutation(({ ctx, input }) => storeDb.setUserRole(input.userId, input.role, ctx.user.id)),
    }),
    reports: router({
      monthly: adminProcedure.input(z.object({
        year: z.number().int().min(2020).max(2100),
        month: z.number().int().min(1).max(12),
      })).query(({ input }) => storeDb.monthlySalesReport(input.year, input.month)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
