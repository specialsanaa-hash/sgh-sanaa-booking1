/**
 * إدارة قوالب الرسائل المخصصة
 * يمكن تعديل القوالب وإضافة قوالب جديدة
 */

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  category: "booking" | "reminder" | "notification" | "custom";
  arContent: string;
  enContent: string;
  variables: string[];
  active: boolean;
}

export const defaultTemplates: Record<string, MessageTemplate> = {
  booking_confirmed: {
    id: "booking_confirmed",
    name: "تأكيد الحجز",
    description: "رسالة تأكيد الحجز للمريض",
    category: "booking",
    arContent:
      "مرحباً {patientName}، تم تأكيد حجزك مع المستشفى السعودي الألماني - صنعاء للموعد في {appointmentDate}. رقم الحجز: {bookingId}. شكراً لاختيارك خدماتنا.",
    enContent:
      "Hello {patientName}, your appointment with Saudi German Hospital - Sana'a has been confirmed for {appointmentDate}. Booking ID: {bookingId}. Thank you for choosing our services.",
    variables: ["patientName", "appointmentDate", "bookingId"],
    active: true,
  },

  booking_cancelled: {
    id: "booking_cancelled",
    name: "إلغاء الحجز",
    description: "رسالة إلغاء الحجز للمريض",
    category: "booking",
    arContent:
      "مرحباً {patientName}، تم إلغاء حجزك مع المستشفى السعودي الألماني - صنعاء. رقم الحجز: {bookingId}. للمزيد من المعلومات، يرجى التواصل معنا على {hospitalPhone}.",
    enContent:
      "Hello {patientName}, your appointment with Saudi German Hospital - Sana'a has been cancelled. Booking ID: {bookingId}. Please contact us at {hospitalPhone} for more information.",
    variables: ["patientName", "bookingId", "hospitalPhone"],
    active: true,
  },

  booking_completed: {
    id: "booking_completed",
    name: "اكتمال الحجز",
    description: "رسالة اكتمال الحجز والشكر للمريض",
    category: "booking",
    arContent:
      "شكراً {patientName} على زيارتك المستشفى السعودي الألماني - صنعاء. نتمنى لك الشفاء العاجل. رقم الحجز: {bookingId}. يمكنك تحميل فاتورتك من البوابة الإلكترونية.",
    enContent:
      "Thank you {patientName} for visiting Saudi German Hospital - Sana'a. We wish you a speedy recovery. Booking ID: {bookingId}. You can download your invoice from the patient portal.",
    variables: ["patientName", "bookingId"],
    active: true,
  },

  booking_reminder: {
    id: "booking_reminder",
    name: "تذكير الموعد",
    description: "رسالة تذكير بالموعد القادم",
    category: "reminder",
    arContent:
      "تذكير: لديك موعد مع المستشفى السعودي الألماني - صنعاء في {appointmentDate} الساعة {appointmentTime}. رقم الحجز: {bookingId}. يرجى الحضور قبل 15 دقيقة.",
    enContent:
      "Reminder: You have an appointment with Saudi German Hospital - Sana'a on {appointmentDate} at {appointmentTime}. Booking ID: {bookingId}. Please arrive 15 minutes early.",
    variables: ["appointmentDate", "appointmentTime", "bookingId"],
    active: true,
  },

  booking_rescheduled: {
    id: "booking_rescheduled",
    name: "تأجيل الموعد",
    description: "رسالة تأجيل الموعد",
    category: "booking",
    arContent:
      "مرحباً {patientName}، تم تأجيل موعدك مع المستشفى السعودي الألماني - صنعاء من {oldDate} إلى {newDate}. رقم الحجز: {bookingId}.",
    enContent:
      "Hello {patientName}, your appointment with Saudi German Hospital - Sana'a has been rescheduled from {oldDate} to {newDate}. Booking ID: {bookingId}.",
    variables: ["patientName", "oldDate", "newDate", "bookingId"],
    active: true,
  },

  prescription_ready: {
    id: "prescription_ready",
    name: "الوصفة الطبية جاهزة",
    description: "إشعار بجاهزية الوصفة الطبية",
    category: "notification",
    arContent:
      "مرحباً {patientName}، وصفتك الطبية جاهزة للاستلام من الصيدلية. رقم الوصفة: {prescriptionId}. يمكنك استلامها في أي وقت.",
    enContent:
      "Hello {patientName}, your prescription is ready for pickup from the pharmacy. Prescription ID: {prescriptionId}. You can pick it up anytime.",
    variables: ["patientName", "prescriptionId"],
    active: true,
  },

  invoice_ready: {
    id: "invoice_ready",
    name: "الفاتورة جاهزة",
    description: "إشعار بجاهزية الفاتورة",
    category: "notification",
    arContent:
      "مرحباً {patientName}، فاتورتك متاحة الآن. رقم الفاتورة: {invoiceId}. المبلغ: {amount} ريال. يمكنك تحميلها من البوابة الإلكترونية.",
    enContent:
      "Hello {patientName}, your invoice is now available. Invoice ID: {invoiceId}. Amount: {amount} SAR. You can download it from the patient portal.",
    variables: ["patientName", "invoiceId", "amount"],
    active: true,
  },

  medical_record_update: {
    id: "medical_record_update",
    name: "تحديث السجل الطبي",
    description: "إشعار بتحديث السجل الطبي",
    category: "notification",
    arContent:
      "مرحباً {patientName}، تم تحديث سجلك الطبي. يمكنك مراجعة التفاصيل من البوابة الإلكترونية.",
    enContent:
      "Hello {patientName}, your medical record has been updated. You can review the details from the patient portal.",
    variables: ["patientName"],
    active: true,
  },
};

/**
 * الحصول على قالب رسالة
 */
export function getTemplate(templateId: string): MessageTemplate | null {
  return defaultTemplates[templateId] || null;
}

/**
 * الحصول على جميع القوالب النشطة
 */
export function getActiveTemplates(): MessageTemplate[] {
  return Object.values(defaultTemplates).filter((t) => t.active);
}

/**
 * الحصول على القوالب حسب الفئة
 */
export function getTemplatesByCategory(
  category: MessageTemplate["category"]
): MessageTemplate[] {
  return Object.values(defaultTemplates).filter(
    (t) => t.category === category && t.active
  );
}

/**
 * استبدال المتغيرات في قالب الرسالة
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  });
  return result;
}

/**
 * التحقق من وجود جميع المتغيرات المطلوبة
 */
export function validateTemplateVariables(
  templateId: string,
  variables: Record<string, string | number>
): { valid: boolean; missingVariables: string[] } {
  const template = getTemplate(templateId);
  if (!template) {
    return { valid: false, missingVariables: [] };
  }

  const missingVariables = template.variables.filter(
    (v) => !(v in variables)
  );

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}
