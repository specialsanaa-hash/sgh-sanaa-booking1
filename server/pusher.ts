import Pusher from 'pusher';
import { ENV } from './_core/env';

// يجب أن تكون مفاتيح Pusher في متغيرات البيئة
if (!ENV.pusherAppId || !ENV.pusherKey || !ENV.pusherSecret || !ENV.pusherCluster) {
  console.warn("[Pusher] Configuration missing. Real-time notifications will be disabled.");
}

export const pusher = new Pusher({
  appId: ENV.pusherAppId || '0', // قيمة وهمية إذا كانت مفقودة
  key: ENV.pusherKey || 'dummy_key',
  secret: ENV.pusherSecret || 'dummy_secret',
  cluster: ENV.pusherCluster || 'mt1',
  useTLS: true,
});

/**
 * إرسال إشعار فوري عند حدوث حجز جديد
 * @param bookingId رقم الحجز
 * @param patientName اسم المريض
 */
export async function notifyNewBooking(bookingId: number, patientName: string) {
  if (!ENV.pusherAppId) return; // لا ترسل إذا لم يكن الإعداد كاملاً

  try {
    await pusher.trigger('dashboard-channel', 'new-booking', {
      message: `حجز جديد رقم ${bookingId} من ${patientName}`,
      bookingId: bookingId,
      timestamp: new Date().toISOString(),
    });
    console.log(`[Pusher] New booking notification sent for ID: ${bookingId}`);
  } catch (error) {
    console.error("[Pusher] Failed to send new booking notification:", error);
  }
}
