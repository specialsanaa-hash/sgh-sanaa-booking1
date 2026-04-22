import { publicProcedure, router, adminProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "../../shared/const";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),

  loginLocal: publicProcedure
    .input(z.object({
      username: z.string().min(1, "اسم المستخدم مطلوب"),
      password: z.string().min(1, "كلمة المرور مطلوبة"),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getUserByUsername } = await import("../db");
      const bcrypt = await import("bcryptjs");
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل الاتصال بقاعدة البيانات",
        });
      }

      // البحث عن المستخدم
      const user = await getUserByUsername(input.username);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        });
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        });
      }

      // تحديث آخر وقت تسجيل دخول
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      // إنشاء جلسة - يتم تعيين cookie مباشرة
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, user.id.toString(), { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  getAllUsers: adminProcedure.query(async () => {
    const { getAllUsers } = await import("../db");
    return getAllUsers();
  }),

  createUser: adminProcedure
    .input(z.object({
      username: z.string().min(1).optional(),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["user", "admin"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { createUser } = await import("../db");
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 10);
      return createUser({
        username: input.username || input.email || `user_${Date.now()}`,
        passwordHash: hashedPassword,
        name: input.name,
        email: input.email,
        role: input.role || "user",
        loginMethod: "local",
      });
    }),

  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["user", "admin"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { updateUser } = await import("../db");
      const { id, ...data } = input;
      return updateUser(id, data);
    }),

  deleteUser: adminProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const { deleteUser } = await import("../db");
      return deleteUser(input);
    }),
});
