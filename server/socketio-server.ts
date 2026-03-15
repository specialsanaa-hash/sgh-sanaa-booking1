import { Socket as SocketIOSocket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { apiKeys, socketConnections, socketMessageLogs } from '../drizzle/schema';

interface AuthenticatedSocket extends SocketIOSocket {
  apiKeyId?: number;
  apiKeyName?: string;
  deviceId?: string;
}

interface SendMessagePayload {
  id: string;
  type: 'whatsapp' | 'sms';
  phoneNumber: string;
  message: string;
  timestamp: number;
}

interface MessageResponsePayload {
  messageId: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  timestamp: number;
}

interface DeviceStatusPayload {
  timestamp: number;
  platform: 'android' | 'ios';
  batteryLevel: number;
  batteryState: 'unplugged' | 'charging' | 'full';
  isCharging: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  isOnline: boolean;
}

interface CommandPayload {
  id: string;
  type: 'get_status' | 'clear_queue' | 'restart' | 'ping';
  timestamp: number;
}

interface CommandResponsePayload {
  commandId: string;
  type: string;
  status: 'success' | 'failed';
  result?: Record<string, any>;
  timestamp: number;
}

/**
 * إعداد خادم Socket.io
 * يتعامل مع الاتصالات من تطبيق الرسائل الخارجي وفق آلية الربط المتقدمة
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
   * التحقق من API Key في Query Parameters
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
      socket.deviceId = `device-${key.id}-${Date.now()}`;

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
      const result = await db
        .insert(socketConnections)
        .values({
          apiKeyId: socket.apiKeyId,
          socketId: socket.id,
          deviceId: socket.deviceId,
          isOnline: 1,
          connectedAt: new Date(),
        });

      const connectionId = (result as any).insertId;

      /**
       * ========================================
       * أحداث استقبال من التطبيق الخارجي
       * ========================================
       */

      /**
       * حدث: message_response
       * يرسله التطبيق لتأكيد نجاح أو فشل إرسال الرسالة
       */
      socket.on('message_response', async (data: MessageResponsePayload) => {
        console.log(`📨 رد على الرسالة ${data.messageId}: ${data.status}`);

        try {
          // تحديث حالة الرسالة في قاعدة البيانات
          await db.insert(socketMessageLogs).values({
            socketConnectionId: connectionId,
            messageId: data.messageId,
            type: 'message_response',
            direction: 'received',
            payload: data,
            status: (data.status as any),
          });

          console.log(`✓ تم تسجيل رد الرسالة ${data.messageId}`);
        } catch (error) {
          console.error(`✗ خطأ في معالجة رد الرسالة:`, error);
        }
      });

      /**
       * حدث: device_status
       * يرسله التطبيق بشكل دوري لتحديث حالة الجهاز
       */
      socket.on('device_status', async (status: DeviceStatusPayload) => {
        console.log(`📱 تحديث حالة الجهاز من ${socket.apiKeyName}:`, {
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
              batteryState: status.batteryState,
              isCharging: status.isCharging ? 1 : 0,
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
       * حدث: command_response
       * يرسله التطبيق ردّاً على الأوامر التي يرسلها السيرفر
       */
      socket.on('command_response', async (data: CommandResponsePayload) => {
        console.log(`⚙️ رد على الأمر ${data.commandId}: ${data.status}`);

        try {
          // تسجيل رد الأمر
          await db.insert(socketMessageLogs).values({
            socketConnectionId: connectionId,
            messageId: data.commandId,
            type: 'command_response',
            direction: 'received',
            payload: data,
            status: (data.status as any),
          });

          console.log(`✓ تم تسجيل رد الأمر ${data.commandId}`);
        } catch (error) {
          console.error(`✗ خطأ في معالجة رد الأمر:`, error);
        }
      });

      /**
       * ========================================
       * أحداث الاتصال والقطع
       * ========================================
       */

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

  console.log(`[Socket.io] Server running on ws://localhost:3000`);
  console.log(`[Socket.io] Connection URL: wss://localhost:3000/socket.io/?apiKey=YOUR_API_KEY`);

  return io;
}

/**
 * دالة لإرسال رسالة من النظام إلى التطبيق الخارجي
 * حدث: send_message
 */
export async function sendMessageToApp(
  io: SocketIOServer,
  apiKeyId: number,
  messageData: SendMessagePayload
) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    // البحث عن الاتصالات النشطة لهذا المفتاح
    const connections = await db
      .select()
      .from(socketConnections)
      .where(eq(socketConnections.apiKeyId, apiKeyId));

    if (!connections || connections.length === 0) {
      console.warn(`⚠️ لا توجد اتصالات نشطة للمفتاح ${apiKeyId}`);
      return false;
    }

    // إرسال الرسالة لجميع الاتصالات النشطة
    let sent = false;
    for (const connection of connections) {
      if (connection.isOnline) {
        io.to(connection.socketId).emit('send_message', messageData);
        sent = true;

        // تسجيل محاولة الإرسال
        await db.insert(socketMessageLogs).values({
          socketConnectionId: connection.id,
          messageId: messageData.id,
          type: 'send_message',
          direction: 'sent',
          payload: messageData,
          status: 'pending',
        });

        console.log(`📤 تم إرسال الرسالة ${messageData.id} إلى ${connection.socketId}`);
      }
    }

    return sent;
  } catch (error) {
    console.error(`✗ خطأ في إرسال الرسالة:`, error);
    return false;
  }
}

/**
 * دالة لإرسال أمر من النظام إلى التطبيق الخارجي
 * حدث: command
 */
export async function sendCommandToApp(
  io: SocketIOServer,
  apiKeyId: number,
  commandData: CommandPayload
) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    // البحث عن الاتصالات النشطة لهذا المفتاح
    const connections = await db
      .select()
      .from(socketConnections)
      .where(eq(socketConnections.apiKeyId, apiKeyId));

    if (!connections || connections.length === 0) {
      console.warn(`⚠️ لا توجد اتصالات نشطة للمفتاح ${apiKeyId}`);
      return false;
    }

    // إرسال الأمر لجميع الاتصالات النشطة
    let sent = false;
    for (const connection of connections) {
      if (connection.isOnline) {
        io.to(connection.socketId).emit('command', commandData);
        sent = true;

        // تسجيل الأمر
        await db.insert(socketMessageLogs).values({
          socketConnectionId: connection.id,
          messageId: commandData.id,
          type: 'command',
          direction: 'sent',
          payload: commandData,
          status: 'pending',
        });

        console.log(`⚙️ تم إرسال الأمر ${commandData.id} (${commandData.type}) إلى ${connection.socketId}`);
      }
    }

    return sent;
  } catch (error) {
    console.error(`✗ خطأ في إرسال الأمر:`, error);
    return false;
  }
}

/**
 * دالة للحصول على حالة الاتصالات النشطة
 */
export async function getActiveConnections(apiKeyId?: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    let query = db.select().from(socketConnections).where(eq(socketConnections.isOnline, 1));

    if (apiKeyId) {
      query = db
        .select()
        .from(socketConnections)
        .where(eq(socketConnections.apiKeyId, apiKeyId));
    }

    return query;
  } catch (error) {
    console.error(`✗ خطأ في الحصول على الاتصالات:`, error);
    return [];
  }
}
