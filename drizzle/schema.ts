import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الحملات الإعلانية (Campaigns)
 * يتم إنشاء نموذج حجز منفصل لكل حملة إعلانية
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * جدول النماذج المخصصة (Forms)
 * كل نموذج مرتبط بحملة إعلانية معينة
 */
export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;

/**
 * جدول الحقول الديناميكية (FormFields)
 * كل حقل ينتمي إلى نموذج معين
 */
export const formFields = mysqlTable("formFields", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull().references(() => forms.id, { onDelete: "cascade" }),
  fieldName: varchar("fieldName", { length: 255 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "email", "phone", "number", "select", "textarea", "date"]).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isRequired: int("isRequired").default(1).notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  options: text("options"), // JSON string for select options
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FormField = typeof formFields.$inferSelect;
export type InsertFormField = typeof formFields.$inferInsert;

/**
 * جدول الحجوزات (Bookings)
 * يحتفظ بجميع بيانات الحجوزات المقدمة من المرضى
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull().references(() => forms.id, { onDelete: "cascade" }),
  campaignId: int("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  patientName: varchar("patientName", { length: 255 }).notNull(),
  patientEmail: varchar("patientEmail", { length: 320 }),
  patientPhone: varchar("patientPhone", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * جدول إجابات النموذج (FormResponses)
 * يحتفظ بإجابات المريض على كل حقل في النموذج
 */
export const formResponses = mysqlTable("formResponses", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  fieldId: int("fieldId").notNull().references(() => formFields.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = typeof formResponses.$inferInsert;