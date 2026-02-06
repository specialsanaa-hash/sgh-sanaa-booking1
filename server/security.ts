/**
 * Security Module
 * Provides security utilities for the application
 */

import { z } from "zod";
import crypto from "crypto";

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * In-memory rate limiter
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const timestamps = this.requests.get(key)!;
    const recentRequests = timestamps.filter((ts) => ts > windowStart);

    if (recentRequests.length < this.config.maxRequests) {
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
      return true;
    }

    return false;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Input validation schemas
 */
export const ValidationSchemas = {
  // Booking validation
  bookingInput: z.object({
    formId: z.number().int().positive("معرف النموذج غير صحيح"),
    campaignId: z.number().int().positive("معرف الحملة غير صحيح"),
    patientName: z.string().min(2, "اسم المريض يجب أن يكون 2 أحرف على الأقل").max(100),
    patientEmail: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
    patientPhone: z.string().regex(/^[0-9+\-\s()]+$/, "رقم الهاتف غير صحيح").min(7).max(20),
  }),

  // Form validation
  formInput: z.object({
    campaignId: z.number().int().positive(),
    title: z.string().min(3, "عنوان النموذج يجب أن يكون 3 أحرف على الأقل").max(200),
    description: z.string().max(1000).optional(),
  }),

  // Form field validation
  formFieldInput: z.object({
    formId: z.number().int().positive(),
    fieldName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "اسم الحقل غير صحيح"),
    fieldType: z.enum(["text", "email", "phone", "number", "select", "textarea", "date"]),
    label: z.string().min(1).max(200),
    isRequired: z.number().int().min(0).max(1).optional(),
    placeholder: z.string().max(200).optional(),
    options: z.string().optional(),
    order: z.number().int().nonnegative(),
  }),

  // Campaign validation
  campaignInput: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
  }),
};

/**
 * Security headers middleware
 */
export function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return escapeMap[char] || char;
    })
    .trim();
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate and sanitize phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Audit logging
 */
export interface AuditLog {
  timestamp: Date;
  userId: number;
  action: string;
  resource: string;
  resourceId: number;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  userId: number,
  action: string,
  resource: string,
  resourceId: number,
  details: string,
  ipAddress?: string,
  userAgent?: string
): AuditLog {
  return {
    timestamp: new Date(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  };
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjectionPattern(input: string): boolean {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(-{2}|\/\*|\*\/|;)/,
    /(\bOR\b.*=.*)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate input against SQL injection
 */
export function validateAgainstSQLInjection(input: string): boolean {
  return !hasSQLInjectionPattern(input);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("يجب أن تكون كلمة المرور 8 أحرف على الأقل");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push("يجب أن تحتوي على أحرف صغيرة");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("يجب أن تحتوي على أحرف كبيرة");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("يجب أن تحتوي على أرقام");

  if (/[!@#$%^&*]/.test(password)) score++;
  else feedback.push("يجب أن تحتوي على رموز خاصة");

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
}
