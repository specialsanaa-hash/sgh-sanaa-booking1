import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";

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


/**
 * جدول إعدادات الرسائل والاتصال بتطبيق الرسائل
 */
export const messageSettings = mysqlTable("messageSettings", {
  id: int("id").autoincrement().primaryKey(),
  platformUrl: varchar("platformUrl", { length: 500 }).notNull(),
  socketUrl: varchar("socketUrl", { length: 500 }).notNull(),
  apiKey: varchar("apiKey", { length: 255 }).notNull(),
  isActive: tinyint("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MessageSettings = typeof messageSettings.$inferSelect;
export type InsertMessageSettings = typeof messageSettings.$inferInsert;

/**
 * جدول الرسائل المرسلة والواردة
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  messageText: text("messageText").notNull(),
  messageType: mysqlEnum("messageType", ["SMS", "WhatsApp"]).notNull(),
  direction: mysqlEnum("direction", ["sent", "received"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed", "read"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  relatedBookingId: int("relatedBookingId"),
  relatedPatientId: int("relatedPatientId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

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

export type FormFieldType = typeof formFields.fieldType.enumValues[number];

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

/**
 * جدول سجلات الأنشطة (ActivityLogs)
 * يسجل جميع الأنشطة الهامة التي يقوم بها المسؤولون
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(), // مثال: 'CREATE_CAMPAIGN', 'UPDATE_BOOKING_STATUS'
  details: text("details"), // تفاصيل إضافية (مثل اسم الحملة، رقم الحجز)
  targetId: int("targetId"), // ID الكائن المتأثر (حملة، حجز، نموذج)
  targetType: mysqlEnum("targetType", ["campaign", "booking", "form", "user"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * جدول الأطباء (Doctors)
 * يحتفظ بمعلومات الأطباء وتخصصاتهم
 */
export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(), // التخصص: جراحة، باطنية، إلخ
  bio: text("bio"), // نبذة عن الطبيب
  image: varchar("image", { length: 500 }), // رابط صورة الطبيب
  experience: varchar("experience", { length: 100 }), // سنوات الخبرة
  qualifications: text("qualifications"), // المؤهلات العلمية (JSON)
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  isActive: int("isActive").default(1).notNull(), // 1 = نشط، 0 = غير نشط
  slug: varchar("slug", { length: 255 }).unique().notNull(), // URL slug للصفحة الثابتة
  metaTitle: varchar("metaTitle", { length: 255 }), // SEO Meta Title
  metaDescription: varchar("metaDescription", { length: 500 }), // SEO Meta Description
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * جدول الصفحات الثابتة (StaticPages)
 * صفحات ثابتة قابلة للفهرسة من محركات البحث (عن المستشفى، الخدمات، إلخ)
 */
export const staticPages = mysqlTable("staticPages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(), // URL slug
  content: text("content").notNull(), // محتوى الصفحة (HTML/Markdown)
  excerpt: text("excerpt"), // ملخص الصفحة
  image: varchar("image", { length: 500 }), // صورة الصفحة
  isPublished: int("isPublished").default(1).notNull(), // 1 = منشورة، 0 = مسودة
  isVisible: int("isVisible").default(1).notNull(), // 1 = مرئية، 0 = مخفية
  order: int("order").default(0).notNull(), // ترتيب الصفحة في القائمة
  metaTitle: varchar("metaTitle", { length: 255 }), // SEO Meta Title
  metaDescription: varchar("metaDescription", { length: 500 }), // SEO Meta Description
  metaKeywords: varchar("metaKeywords", { length: 500 }), // SEO Keywords
  canonicalUrl: varchar("canonicalUrl", { length: 500 }), // Canonical URL
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaticPage = typeof staticPages.$inferSelect;
export type InsertStaticPage = typeof staticPages.$inferInsert;

/**
 * جدول حجوزات الأطباء (DoctorBookings)
 * يحتفظ بحجوزات المرضى عند الأطباء
 */
export const doctorBookings = mysqlTable("doctorBookings", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  patientName: varchar("patientName", { length: 255 }).notNull(),
  patientEmail: varchar("patientEmail", { length: 320 }),
  patientPhone: varchar("patientPhone", { length: 20 }).notNull(),
  appointmentDate: timestamp("appointmentDate"), // موعد الحجز
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  notes: text("notes"), // ملاحظات إضافية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DoctorBooking = typeof doctorBookings.$inferSelect;
export type InsertDoctorBooking = typeof doctorBookings.$inferInsert;

/**
 * جدول المرضى (Patients)
 * يحتفظ بمعلومات المريض الشخصية والطبية الأساسية
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(), // ربط مع جدول المستخدمين
  nationalId: varchar("nationalId", { length: 20 }).unique(), // رقم الهوية الوطنية
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"), // تاريخ الميلاد
  gender: mysqlEnum("gender", ["male", "female", "other"]), // الجنس
  bloodType: varchar("bloodType", { length: 10 }), // فصيلة الدم
  address: text("address"), // العنوان
  city: varchar("city", { length: 100 }), // المدينة
  emergencyContact: varchar("emergencyContact", { length: 255 }), // جهة الاتصال الطارئة
  emergencyPhone: varchar("emergencyPhone", { length: 20 }), // رقم جهة الاتصال الطارئة
  allergies: text("allergies"), // الحساسيات (JSON)
  chronicDiseases: text("chronicDiseases"), // الأمراض المزمنة (JSON)
  currentMedications: text("currentMedications"), // الأدوية الحالية (JSON)
  insuranceProvider: varchar("insuranceProvider", { length: 255 }), // شركة التأمين
  insuranceNumber: varchar("insuranceNumber", { length: 100 }), // رقم التأمين
  profileImage: varchar("profileImage", { length: 500 }), // صورة الملف الشخصي
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * جدول المواعيد الطبية (Appointments)
 * يحتفظ بمواعيد المريض مع الأطباء
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  appointmentDate: timestamp("appointmentDate").notNull(), // موعد الحجز
  duration: int("duration").default(30).notNull(), // مدة الموعد بالدقائق
  reason: text("reason"), // سبب الزيارة
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show"]).default("scheduled").notNull(), // حالة الموعد
  notes: text("notes"), // ملاحظات الطبيب
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * جدول السجل الطبي (MedicalRecords)
 * يحتفظ بالتقارير والفحوصات الطبية للمريض
 */
export const medicalRecords = mysqlTable("medicalRecords", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  appointmentId: int("appointmentId").references(() => appointments.id, { onDelete: "set null" }), // ربط مع الموعد
  recordType: mysqlEnum("recordType", ["diagnosis", "prescription", "lab_report", "imaging", "procedure", "note"]).notNull(), // نوع السجل
  title: varchar("title", { length: 255 }).notNull(), // عنوان السجل
  description: text("description"), // وصف السجل
  findings: text("findings"), // النتائج
  recommendations: text("recommendations"), // التوصيات
  attachmentUrl: varchar("attachmentUrl", { length: 500 }), // رابط المرفق (صورة، ملف PDF)
  isVisible: int("isVisible").default(1).notNull(), // هل السجل مرئي للمريض
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;

/**
 * جدول الرسائل (Messages)
 * يحتفظ برسائل التواصل بين المريض والطبيب
 */

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * جدول الفواتير (Invoices)
 * يحتفظ بفواتير المريض والدفعات
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  appointmentId: int("appointmentId").references(() => appointments.id, { onDelete: "set null" }), // ربط مع الموعد
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(), // رقم الفاتورة
  amount: int("amount").notNull(), // المبلغ بالفلس (لتجنب مشاكل العشرية)
  currency: varchar("currency", { length: 10 }).default("YER").notNull(), // العملة
  description: text("description"), // وصف الفاتورة
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(), // حالة الفاتورة
  dueDate: timestamp("dueDate"), // تاريخ الاستحقاق
  paidDate: timestamp("paidDate"), // تاريخ الدفع
  paymentMethod: varchar("paymentMethod", { length: 50 }), // طريقة الدفع (credit_card, bank_transfer, cash)
  notes: text("notes"), // ملاحظات
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * جدول الوصفات الطبية (Prescriptions)
 * يحتفظ بالأدوية الموصوفة للمريض
 */
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId: int("doctorId").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  appointmentId: int("appointmentId").references(() => appointments.id, { onDelete: "set null" }), // ربط مع الموعد
  medicationName: varchar("medicationName", { length: 255 }).notNull(), // اسم الدواء
  dosage: varchar("dosage", { length: 100 }).notNull(), // الجرعة
  frequency: varchar("frequency", { length: 100 }).notNull(), // التكرار (مثل: 3 مرات يومياً)
  duration: varchar("duration", { length: 100 }).notNull(), // المدة (مثل: 7 أيام)
  instructions: text("instructions"), // تعليمات الاستخدام
  sideEffects: text("sideEffects"), // الآثار الجانبية المحتملة
  startDate: timestamp("startDate").notNull(), // تاريخ البدء
  endDate: timestamp("endDate"), // تاريخ الانتهاء
  isActive: int("isActive").default(1).notNull(), // هل الوصفة نشطة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;
