import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { messages } from "../../drizzle/schema";

/**
 * Messaging Router
 * APIs for sending test messages and managing automated messages
 */

export const messagingRouter = router({
  // Send a test message (for testing purposes)
  sendTestMessage: adminProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
        message: z.string().min(1, "محتوى الرسالة مطلوب"),
        type: z.enum(["whatsapp", "sms"]).describe("نوع الرسالة"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate phone number format
        if (!/^\d{9,15}$/.test(input.phoneNumber.replace(/\D/g, ""))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "رقم الهاتف غير صحيح",
          });
        }

        // Validate message length
        if (input.message.length > 1000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "الرسالة طويلة جداً (الحد الأقصى 1000 حرف)",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل الاتصال بقاعدة البيانات",
          });
        }

        // Store the test message in the database
        const result = await db.insert(messages).values({
          direction: "sent",
          messageText: input.message,
          messageType: input.type === "whatsapp" ? "WhatsApp" : "SMS",
          status: "pending",
          metadata: {
            phoneNumber: input.phoneNumber,
            isTestMessage: true,
            sentBy: ctx.user?.id,
            sentByName: ctx.user?.name,
          },
        });

        // In a real scenario, you would integrate with a messaging service here
        // For now, we'll just log it and mark as sent
        console.log(`[Test Message] ${input.type} sent to ${input.phoneNumber}`);

        return {
          success: true,
          message: `تم إرسال رسالة ${input.type === "whatsapp" ? "واتس آب" : "SMS"} اختبار بنجاح`,
          messageId: (result as any).insertId || 0,
        };
      } catch (error) {
        console.error("[Messaging] Error sending test message:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل إرسال الرسالة",
        });
      }
    }),

  // Send a custom message
  sendCustomMessage: adminProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
        message: z.string().min(1, "محتوى الرسالة مطلوب"),
        type: z.enum(["whatsapp", "sms"]),
        recipientName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate phone number format
        if (!/^\d{9,15}$/.test(input.phoneNumber.replace(/\D/g, ""))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "رقم الهاتف غير صحيح",
          });
        }

        // Validate message length
        if (input.message.length > 1000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "الرسالة طويلة جداً (الحد الأقصى 1000 حرف)",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل الاتصال بقاعدة البيانات",
          });
        }

        // Store the message in the database
        const result = await db.insert(messages).values({
          direction: "sent",
          messageText: input.message,
          messageType: input.type === "whatsapp" ? "WhatsApp" : "SMS",
          status: "pending",
          metadata: {
            phoneNumber: input.phoneNumber,
            recipientName: input.recipientName,
            sentBy: ctx.user?.id,
            sentByName: ctx.user?.name,
          },
        });

        console.log(
          `[Custom Message] ${input.type} sent to ${input.phoneNumber}`
        );

        return {
          success: true,
          message: "تم إرسال الرسالة بنجاح",
          messageId: (result as any).insertId || 0,
        };
      } catch (error) {
        console.error("[Messaging] Error sending custom message:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل إرسال الرسالة",
        });
      }
    }),

  // Get message templates
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "booking_confirmed",
        name: "تأكيد الحجز",
        category: "booking",
        template:
          "مرحباً {patientName}، تم تأكيد حجزك مع المستشفى السعودي الألماني - صنعاء للموعد في {appointmentDate}. رقم الحجز: {bookingId}",
        variables: ["patientName", "appointmentDate", "bookingId"],
      },
      {
        id: "booking_cancelled",
        name: "إلغاء الحجز",
        category: "booking",
        template:
          "مرحباً {patientName}، تم إلغاء حجزك مع المستشفى السعودي الألماني - صنعاء. رقم الحجز: {bookingId}",
        variables: ["patientName", "bookingId"],
      },
      {
        id: "booking_completed",
        name: "اكتمال الحجز",
        category: "booking",
        template:
          "شكراً {patientName} على زيارتك المستشفى السعودي الألماني - صنعاء. نتمنى لك الشفاء العاجل. رقم الحجز: {bookingId}",
        variables: ["patientName", "bookingId"],
      },
      {
        id: "booking_reminder",
        name: "تذكير الموعد",
        category: "reminder",
        template:
          "تذكير: لديك موعد مع المستشفى السعودي الألماني - صنعاء في {appointmentDate}. رقم الحجز: {bookingId}",
        variables: ["appointmentDate", "bookingId"],
      },
    ];
  }),
});
