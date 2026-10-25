import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      return {
        ...shape,
        message: "تعذر إكمال العملية بسبب خطأ مؤقت. أعيدي المحاولة بعد قليل.",
        data: { ...shape.data, stack: undefined },
      };
    }
    return { ...shape, data: { ...shape.data, stack: undefined } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(requireUser);

// تم تعطيل التحقق من صلاحية المشرف مؤقتاً
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  return next({ ctx });
});
