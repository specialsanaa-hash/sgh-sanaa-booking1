import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// يتم استخدام هذا الإجراء كـ Webhook لتلقي إشعارات من أنظمة خارجية (مثل CRM)
// لا يتطلب مصادقة (publicProcedure) لأنه يُفترض أن النظام الخارجي يرسل مفتاح سري (Secret Key) للتحقق
export const webhookRouter = router({
  // إجراء لمعالجة طلبات الويب هوك الواردة
  receive: publicProcedure
    .input(
      z.object({
        secret: z.string().min(1, "Secret key is required"),
        event: z.string().min(1, "Event type is required"),
        payload: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // التحقق من المفتاح السري (يجب أن يكون هذا المفتاح محفوظاً في متغيرات البيئة)
      // في هذا المثال، سنفترض أن المفتاح السري هو "CRM_SECRET_KEY"
      if (input.secret !== "CRM_SECRET_KEY") {
        console.error(`[Webhook] فشل التحقق من مفتاح الويب هوك السري للحدث: ${input.event}`);
        throw new Error("Unauthorized Webhook Access");
      }

      // تسجيل النشاط
      console.log(`[Webhook] تم استلام ويب هوك للحدث: ${input.event}`);

      // هنا يمكن إضافة منطق معالجة الحمولة (Payload)
      // مثال: تحديث حالة حجز معين بناءً على الـ payload

      return { success: true, message: `Webhook for event ${input.event} processed successfully` };
    }),
});
