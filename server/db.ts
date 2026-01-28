import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, campaigns, forms, formFields, bookings, formResponses, InsertCampaign, InsertForm, InsertFormField, InsertBooking, InsertFormResponse, activityLogs, InsertActivityLog, doctors, staticPages, doctorBookings, InsertDoctor, InsertStaticPage, InsertDoctorBooking } from "../drizzle/schema";
import { ENV } from './_core/env';
import { notifyNewBooking } from "./pusher";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.createdAt);
}

// ============ Campaigns ============
export async function getCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(campaigns.createdAt);
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(data);
  return result;
}

// ============ Forms ============
export async function getFormsByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(forms).where(eq(forms.campaignId, campaignId)).orderBy(forms.createdAt);
}

export async function getFormById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createForm(data: InsertForm) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(forms).values(data);
  return result;
}

export async function updateForm(id: number, data: Partial<InsertForm>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(forms).set(data).where(eq(forms.id, id));
}

export async function deleteForm(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related form fields first
  await db.delete(formFields).where(eq(formFields.formId, id));
  // Then delete the form
  return db.delete(forms).where(eq(forms.id, id));
}

// ============ Form Fields ============
export async function getFormFields(formId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formFields).where(eq(formFields.formId, formId)).orderBy(formFields.order);
}

export async function createFormField(data: InsertFormField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(formFields).values(data);
}

export async function updateFormField(id: number, data: Partial<InsertFormField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(formFields).set(data).where(eq(formFields.id, id));
}

export async function deleteFormField(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(formFields).where(eq(formFields.id, id));
}

// ============ Bookings ============
export async function getBookings(formId?: number, campaignId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (formId) {
    return db.select().from(bookings).where(eq(bookings.formId, formId)).orderBy(bookings.createdAt);
  }
  if (campaignId) {
    return db.select().from(bookings).where(eq(bookings.campaignId, campaignId)).orderBy(bookings.createdAt);
  }
  
  return db.select().from(bookings).orderBy(bookings.createdAt);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(data);
  // Get the inserted booking ID
  const insertedBooking = await db.select().from(bookings).where(eq(bookings.patientPhone, data.patientPhone)).orderBy(desc(bookings.id)).limit(1);
  
  const newBooking = insertedBooking[0] || result;

  // إرسال إشعار فوري
  if (newBooking.id) {
    await notifyNewBooking(newBooking.id, data.patientName);
  }

  return newBooking;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set(data).where(eq(bookings.id, id));
}

export async function deleteBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete form responses first due to foreign key constraint
  await db.delete(formResponses).where(eq(formResponses.bookingId, id));
  // Then delete the booking
  return db.delete(bookings).where(eq(bookings.id, id));
}

// ============ Form Responses ============
export async function createFormResponse(data: InsertFormResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(formResponses).values(data);
}

export async function getFormResponsesByBooking(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(formResponses).where(eq(formResponses.bookingId, bookingId));
}

// ============ Activity Logs ============
export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(activityLogs).values(data);
}

export async function getActivityLogs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
}

// ============ Doctors ============
export async function createDoctor(data: InsertDoctor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(doctors).values(data);
}

export async function getDoctors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doctors).where(eq(doctors.isActive, 1)).orderBy(doctors.name);
}

export async function getDoctorBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(doctors).where(eq(doctors.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getDoctorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result[0] || null;
}

export async function updateDoctor(id: number, data: Partial<InsertDoctor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(doctors).set(data).where(eq(doctors.id, id));
}

export async function deleteDoctor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete doctor bookings first due to foreign key constraint
  await db.delete(doctorBookings).where(eq(doctorBookings.doctorId, id));
  // Then delete the doctor
  return db.delete(doctors).where(eq(doctors.id, id));
}

// ============ Static Pages ============
export async function createStaticPage(data: InsertStaticPage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(staticPages).values(data);
}

export async function getStaticPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staticPages).where(eq(staticPages.isPublished, 1)).orderBy(staticPages.order);
}

export async function getStaticPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staticPages).where(eq(staticPages.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getStaticPageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staticPages).where(eq(staticPages.id, id)).limit(1);
  return result[0] || null;
}

export async function updateStaticPage(id: number, data: Partial<InsertStaticPage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staticPages).set(data).where(eq(staticPages.id, id));
}

export async function deleteStaticPage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(staticPages).where(eq(staticPages.id, id));
}

// ============ Doctor Bookings ============
export async function createDoctorBooking(data: InsertDoctorBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(doctorBookings).values(data);
}

export async function getDoctorBookings(doctorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doctorBookings).where(eq(doctorBookings.doctorId, doctorId)).orderBy(desc(doctorBookings.createdAt));
}

export async function getDoctorBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(doctorBookings).where(eq(doctorBookings.id, id)).limit(1);
  return result[0] || null;
}

export async function updateDoctorBooking(id: number, data: Partial<InsertDoctorBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(doctorBookings).set(data).where(eq(doctorBookings.id, id));
}

export async function deleteDoctorBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(doctorBookings).where(eq(doctorBookings.id, id));
}
