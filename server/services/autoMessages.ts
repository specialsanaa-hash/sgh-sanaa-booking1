import { getDb } from "../db";
import { messages } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

/**
 * قوالب الرسائل المخصصة لكل حالة حجز
 */
export const messageTemplates = {
  booking_confirmed: {
    ar: "مرحباً {patientName}، تم تأكيد حجزك مع المستشفى السعودي الألماني - صنعاء للموعد في {appointmentDate}. رقم الحجز: {bookingId}",
    en: "Hello {patientName}, your appointment with Saudi German Hospital - Sana'a has been confirmed for {appointmentDate}. Booking ID: {bookingId}"
  },
  booking_cancelled: {
    ar: "مرحباً {patientName}، تم إلغاء حجزك مع المستشفى السعودي الألماني - صنعاء. رقم الحجز: {bookingId}. للمزيد من المعلومات، يرجى التواصل معنا.",
    en: "Hello {patientName}, your appointment with Saudi German Hospital - Sana'a has been cancelled. Booking ID: {bookingId}. Please contact us for more information."
  },
  booking_completed: {
    ar: "شكراً {patientName} على زيارتك المستشفى السعودي الألماني - صنعاء. نتمنى لك الشفاء العاجل. رقم الحجز: {bookingId}",
    en: "Thank you {patientName} for visiting Saudi German Hospital - Sana'a. We wish you a speedy recovery. Booking ID: {bookingId}"
  },
  booking_reminder: {
    ar: "تذكير: لديك موعد مع المستشفى السعودي الألماني - صنعاء في {appointmentDate}. رقم الحجز: {bookingId}",
    en: "Reminder: You have an appointment with Saudi German Hospital - Sana'a on {appointmentDate}. Booking ID: {bookingId}"
  }
};

/**
 * استبدال المتغيرات في قالب الرسالة
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
}

/**
 * إرسال رسالة تلقائية عند تأكيد الحجز
 */
export async function sendBookingConfirmedMessage(
  phoneNumber: string,
  patientName: string,
  appointmentDate: string,
  bookingId: number,
  messageType: "SMS" | "WhatsApp" = "SMS"
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    // استبدال المتغيرات في القالب
    const messageText = replaceTemplateVariables(
      messageTemplates.booking_confirmed.ar,
      {
        patientName,
        appointmentDate,
        bookingId,
      }
    );

    // حفظ الرسالة في قاعدة البيانات
    const result = await db.insert(messages).values({
      phoneNumber,
      messageText,
      messageType,
      direction: "sent",
      status: "pending",
      relatedBookingId: bookingId,
    });

    console.log(`[Auto Message] Booking confirmed message sent to ${phoneNumber}`);

    return {
      success: true,
      messageId: (result as any).insertId || 0,
    };
  } catch (error) {
    console.error("[Auto Message] Error sending booking confirmed message:", error);
    return { success: false };
  }
}

/**
 * إرسال رسالة تلقائية عند إلغاء الحجز
 */
export async function sendBookingCancelledMessage(
  phoneNumber: string,
  patientName: string,
  bookingId: number,
  messageType: "SMS" | "WhatsApp" = "SMS"
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    // استبدال المتغيرات في القالب
    const messageText = replaceTemplateVariables(
      messageTemplates.booking_cancelled.ar,
      {
        patientName,
        bookingId,
      }
    );

    // حفظ الرسالة في قاعدة البيانات
    const result = await db.insert(messages).values({
      phoneNumber,
      messageText,
      messageType,
      direction: "sent",
      status: "pending",
      relatedBookingId: bookingId,
    });

    console.log(`[Auto Message] Booking cancelled message sent to ${phoneNumber}`);

    return {
      success: true,
      messageId: (result as any).insertId || 0,
    };
  } catch (error) {
    console.error("[Auto Message] Error sending booking cancelled message:", error);
    return { success: false };
  }
}

/**
 * إرسال رسالة تلقائية عند اكتمال الحجز
 */
export async function sendBookingCompletedMessage(
  phoneNumber: string,
  patientName: string,
  bookingId: number,
  messageType: "SMS" | "WhatsApp" = "SMS"
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    // استبدال المتغيرات في القالب
    const messageText = replaceTemplateVariables(
      messageTemplates.booking_completed.ar,
      {
        patientName,
        bookingId,
      }
    );

    // حفظ الرسالة في قاعدة البيانات
    const result = await db.insert(messages).values({
      phoneNumber,
      messageText,
      messageType,
      direction: "sent",
      status: "pending",
      relatedBookingId: bookingId,
    });

    console.log(`[Auto Message] Booking completed message sent to ${phoneNumber}`);

    return {
      success: true,
      messageId: (result as any).insertId || 0,
    };
  } catch (error) {
    console.error("[Auto Message] Error sending booking completed message:", error);
    return { success: false };
  }
}

/**
 * إرسال رسالة تذكير عن الموعد
 */
export async function sendBookingReminderMessage(
  phoneNumber: string,
  patientName: string,
  appointmentDate: string,
  bookingId: number,
  messageType: "SMS" | "WhatsApp" = "SMS"
): Promise<{ success: boolean; messageId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    // استبدال المتغيرات في القالب
    const messageText = replaceTemplateVariables(
      messageTemplates.booking_reminder.ar,
      {
        patientName,
        appointmentDate,
        bookingId,
      }
    );

    // حفظ الرسالة في قاعدة البيانات
    const result = await db.insert(messages).values({
      phoneNumber,
      messageText,
      messageType,
      direction: "sent",
      status: "pending",
      relatedBookingId: bookingId,
    });

    console.log(`[Auto Message] Booking reminder message sent to ${phoneNumber}`);

    return {
      success: true,
      messageId: (result as any).insertId || 0,
    };
  } catch (error) {
    console.error("[Auto Message] Error sending booking reminder message:", error);
    return { success: false };
  }
}
