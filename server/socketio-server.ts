import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { apiKeys, socketConnections, socketMessageLogs } from '../drizzle/schema';

interface AuthenticatedSocket extends Socket {
  apiKeyId?: number;
  apiKeyName?: string;
}

/**
 * إعداد خادم Socket.io
 * يتعامل مع الاتصالات من تطبيق الرسائل الخارجي
 */
export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  /**
   * Middleware للمصادقة
   * التحقق من API Key قبل السماح بالاتصال
   */
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const apiKey = socket.handshake.query.apiKey as string;

      if (!apiKey) {
        return next(new Error('API Key مفقود'));
      }

      const db = await getDb();
      if (!db) {
        return next(new Error('خطأ في الاتصال بقاعدة البيانات'));
      }

      // البحث عن المفتاح في قاعدة البيانات
      const keyRecord = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.key, apiKey))
        .limit(1);

      if (!keyRecord || keyRecord.length === 0) {
        return next(new Error('API Key غير صحيح'));
      }

      const key = keyRecord[0];

      if (!key.isActive) {
        return next(new Error('API Key غير مفعل'));
      }

      // حفظ معلومات المفتاح في Socket
      socket.apiKeyId = key.id;
      socket.apiKeyName = key.name;

      // تحديث وقت آخر استخدام
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, key.id));

      next();
    } catch (error) {
      next(new Error(`خطأ في المصادقة: ${error}`));
    }
  });

  /**
   * حدث الاتصال الناجح
   */
  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`✓ اتصال جديد: ${socket.id} (${socket.apiKeyName})`);

    try {
      const db = await getDb();
      if (!db || !socket.apiKeyId) return;

      // تسجيل الاتصال في قاعدة البيانات
      const [connection] = await db
        .insert(socketConnections)
        .values({
          apiKeyId: socket.apiKeyId,
          socketId: socket.id,
          isOnline: 1,
          connectedAt: new Date(),
        });

      const connectionId = connection.insertId;

      /**
       * حدث إرسال الرسالة من التطبيق الخارجي
       * البيانات المتوقعة:
       * {
       *   id: "msg-12345",
       *   type: "whatsapp" | "sms",
       *   phoneNumber: "+966501234567",
       *   message: "نص الرسالة",
       *   timestamp: 1678900000000
       * }
       */
      socket.on('send_message', async (data) => {
        console.log(`📤 رسالة جديدة من ${socket.apiKeyName}:`, data.id);

        try {
          // التحقق من صحة البيانات
          if (!data.id || !data.type || !data.phoneNumber || !data.message) {
            throw new Error('بيانات الرسالة غير كاملة');
          }

          if (!['whatsapp', 'sms'].includes(data.type)) {
            throw new Error('نوع الرسالة غير صحيح');
          }

          // تسجيل الرسالة في قاعدة البيانات
          await db.insert(socketMessageLogs).values({
            socketConnectionId: connectionId,
            messageId: data.id,
            type: 'send_message',
            direction: 'sent',
            payload: data,
            status: 'pending',
          });

          // إرسال تأكيد الاستقبال
          socket.emit('message_received', {
            messageId: data.id,
            status: 'received',
            timestamp: Date.now(),
          });

          console.log(`✓ تم استقبال الرسالة ${data.id}`);
        } catch (error) {
          console.error(`✗ خطأ في معالجة الرسالة:`, error);

          // إرسال رسالة خطأ
          socket.emit('message_response', {
            messageId: data.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'خطأ غير معروف',
            timestamp: Date.now(),
          });
        }
      });

      /**
       * حدث حالة الجهاز
       * البيانات المتوقعة:
       * {
       *   timestamp: 1678900000000,
       *   platform: "ios" | "android",
       *   batteryLevel: 85,
       *   batteryState: "charging" | "discharging" | "full",
       *   isCharging: true,
       *   networkType: "wifi" | "cellular" | "none",
       *   isOnline: true
       * }
       */
      socket.on('device_status', async (status) => {
        console.log(`📱 حالة الجهاز من ${socket.apiKeyName}:`, {
          battery: status.batteryLevel + '%',
          network: status.networkType,
          online: status.isOnline,
        });

        try {
          // تحديث معلومات الاتصال
          await db
            .update(socketConnections)
            .set({
              platform: status.platform,
              batteryLevel: status.batteryLevel,
              networkType: status.networkType,
              isOnline: status.isOnline ? 1 : 0,
              lastHeartbeat: new Date(),
            })
            .where(eq(socketConnections.id, connectionId));

          // تسجيل حالة الجهاز
          await db.insert(socketMessageLogs).values({
            socketConnectionId: connectionId,
            messageId: `status-${Date.now()}`,
            type: 'device_status',
            direction: 'received',
            payload: status,
            status: 'delivered',
          });

          // تنبيهات مهمة
          if (status.batteryLevel < 20) {
            console.warn(`⚠️ البطارية منخفضة جداً (${status.batteryLevel}%)`);
          }

          if (!status.isOnline) {
            console.warn(`⚠️ الجهاز غير متصل بالإنترنت`);
          }
        } catch (error) {
          console.error(`✗ خطأ في معالجة حالة الجهاز:`, error);
        }
      });

      /**
       * حدث قطع الاتصال
       */
      socket.on('disconnect', async (reason) => {
        console.log(`✗ قطع الاتصال: ${socket.id} (${reason})`);

        try {
          // تحديث حالة الاتصال
          await db
            .update(socketConnections)
            .set({
              isOnline: 0,
              disconnectedAt: new Date(),
            })
            .where(eq(socketConnections.id, connectionId));
        } catch (error) {
          console.error(`✗ خطأ في تحديث حالة قطع الاتصال:`, error);
        }
      });

      /**
       * حدث الخطأ
       */
      socket.on('error', (error) => {
        console.error(`⚠️ خطأ في Socket: ${socket.id}`, error);
      });
    } catch (error) {
      console.error(`✗ خطأ في معالجة الاتصال:`, error);
      socket.disconnect();
    }
  });

  return io;
}

/**
 * دالة لإرسال رسالة من النظام إلى التطبيق الخارجي
 * تُستخدم عند تغيير حالة الحجز
 */
export async function sendMessageToApp(
  apiKeyId: number,
  messageData: {
    id: string;
    type: 'whatsapp' | 'sms';
    phoneNumber: string;
    message: string;
  }
) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    // البحث عن الاتصال النشط للمفتاح
    const connections = await db
      .select()
      .from(socketConnections)
      .where(eq(socketConnections.apiKeyId, apiKeyId));

    if (!connections || connections.length === 0) {
      console.warn(`⚠️ لا توجد اتصالات نشطة للمفتاح ${apiKeyId}`);
      return false;
    }

    // تسجيل الرسالة
    await db.insert(socketMessageLogs).values({
      socketConnectionId: connections[0].id,
      messageId: messageData.id,
      type: 'send_message',
      direction: 'sent',
      payload: messageData,
      status: 'pending',
    });

    console.log(`✓ تم تسجيل الرسالة ${messageData.id} للإرسال`);
    return true;
  } catch (error) {
    console.error(`✗ خطأ في إرسال الرسالة:`, error);
    return false;
  }
}

/**
 * دالة للحصول على حالة الاتصال
 */
export async function getConnectionStatus(apiKeyId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    const connections = await db
      .select()
      .from(socketConnections)
      .where(eq(socketConnections.apiKeyId, apiKeyId));

    if (!connections || connections.length === 0) {
      return {
        isConnected: false,
        message: 'لا توجد اتصالات نشطة',
      };
    }

    const connection = connections[0];
    return {
      isConnected: connection.isOnline === 1,
      socketId: connection.socketId,
      platform: connection.platform,
      batteryLevel: connection.batteryLevel,
      networkType: connection.networkType,
      lastHeartbeat: connection.lastHeartbeat,
      connectedAt: connection.connectedAt,
    };
  } catch (error) {
    console.error(`✗ خطأ في الحصول على حالة الاتصال:`, error);
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
    };
  }
}
