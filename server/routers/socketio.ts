import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as apiKeyService from '../services/apiKeyService';
import { getDb } from '../db';
import { socketConnections, socketMessageLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const socketioRouter = router({
  /**
   * إنشاء مفتاح API جديد
   */
  createApiKey: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, 'اسم المفتاح مطلوب'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await apiKeyService.createApiKey(
          ctx.user.id,
          input.name,
          input.description
        );

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        throw new Error(`فشل إنشاء مفتاح API: ${error}`);
      }
    }),

  /**
   * الحصول على جميع مفاتيح المستخدم
   */
  getMyApiKeys: protectedProcedure.query(async ({ ctx }) => {
    try {
      const keys = await apiKeyService.getUserApiKeys(ctx.user.id);
      return {
        success: true,
        data: keys,
      };
    } catch (error) {
      throw new Error(`فشل الحصول على مفاتيح API: ${error}`);
    }
  }),

  /**
   * تفعيل/تعطيل مفتاح API
   */
  toggleApiKey: adminProcedure
    .input(
      z.object({
        keyId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await apiKeyService.toggleApiKey(input.keyId, input.isActive);
        return { success: true };
      } catch (error) {
        throw new Error(`فشل تغيير حالة المفتاح: ${error}`);
      }
    }),

  /**
   * حذف مفتاح API
   */
  deleteApiKey: adminProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await apiKeyService.deleteApiKey(input.keyId);
        return { success: true };
      } catch (error) {
        throw new Error(`فشل حذف المفتاح: ${error}`);
      }
    }),

  /**
   * إعادة تعيين مفتاح API
   */
  regenerateApiKey: adminProcedure
    .input(z.object({ keyId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const result = await apiKeyService.regenerateApiKey(input.keyId);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        throw new Error(`فشل إعادة تعيين المفتاح: ${error}`);
      }
    }),

  /**
   * الحصول على حالة الاتصالات النشطة
   */
  getActiveConnections: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

      const connections = await db
        .select()
        .from(socketConnections)
        .where(eq(socketConnections.isOnline, 1));

      return {
        success: true,
        data: connections.map((c) => ({
          id: c.id,
          socketId: c.socketId,
          platform: c.platform,
          batteryLevel: c.batteryLevel,
          networkType: c.networkType,
          lastHeartbeat: c.lastHeartbeat,
          connectedAt: c.connectedAt,
        })),
      };
    } catch (error) {
      throw new Error(`فشل الحصول على الاتصالات: ${error}`);
    }
  }),

  /**
   * الحصول على سجل الرسائل
   */
  getMessageLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        type: z.enum(['send_message', 'device_status', 'message_response']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

        let logs;
        
        if (input.type) {
          logs = await db
            .select()
            .from(socketMessageLogs)
            .where(eq(socketMessageLogs.type, input.type))
            .orderBy((t) => t.createdAt)
            .limit(input.limit)
            .offset(input.offset);
        } else {
          logs = await db
            .select()
            .from(socketMessageLogs)
            .orderBy((t) => t.createdAt)
            .limit(input.limit)
            .offset(input.offset);
        }

        return {
          success: true,
          data: logs,
        };
      } catch (error) {
        throw new Error(`فشل الحصول على السجلات: ${error}`);
      }
    }),

  /**
   * إحصائيات الرسائل
   */
  getMessageStats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

      const logs = await db.select().from(socketMessageLogs);

      const stats = {
        total: logs.length,
        sent: logs.filter((l) => l.direction === 'sent').length,
        received: logs.filter((l) => l.direction === 'received').length,
        pending: logs.filter((l) => l.status === 'pending').length,
        delivered: logs.filter((l) => l.status === 'delivered').length,
        failed: logs.filter((l) => l.status === 'failed').length,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new Error(`فشل الحصول على الإحصائيات: ${error}`);
    }
  }),

  /**
   * الحصول على معلومات الاتصال
   */
  getConnectionInfo: adminProcedure
    .input(z.object({ socketId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

        const connection = await db
          .select()
          .from(socketConnections)
          .where(eq(socketConnections.socketId, input.socketId))
          .limit(1);

        if (!connection || connection.length === 0) {
          throw new Error('الاتصال غير موجود');
        }

        return {
          success: true,
          data: connection[0],
        };
      } catch (error) {
        throw new Error(`فشل الحصول على معلومات الاتصال: ${error}`);
      }
    }),
});
