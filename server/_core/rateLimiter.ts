import { TRPCError } from "@trpc/server";

// In-memory store for rate limiting (for demonstration/simple use cases)
// In a production environment, use Redis or a dedicated rate limiting service.
const requestCounts = new Map<string, { count: number, resetTime: number }>();

const MAX_REQUESTS = 5; // الحد الأقصى لعدد الطلبات
const WINDOW_MS = 60000; // فترة السماح بالمللي ثانية (دقيقة واحدة)

/**
 * دالة لتطبيق Rate Limiting على أساس IP المستخدم
 * @param ip عنوان IP للمستخدم
 */
export function rateLimiter(ip: string) {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || record.resetTime < now) {
    // إنشاء سجل جديد أو إعادة تعيينه
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "تم تجاوز الحد الأقصى لعدد الطلبات. يرجى المحاولة لاحقاً.",
    });
  }

  record.count += 1;
  requestCounts.set(ip, record);
}

// تنظيف السجلات القديمة بشكل دوري (للتخفيف من استهلاك الذاكرة)
setInterval(() => {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  for (const [ip, record] of requestCounts.entries()) {
    if (record.resetTime < now) {
      entriesToDelete.push(ip);
    }
  }
  entriesToDelete.forEach(ip => requestCounts.delete(ip));
}, WINDOW_MS);
