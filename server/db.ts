import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, campaigns, forms, formFields, bookings, formResponses, InsertCampaign, InsertForm, InsertFormField, InsertBooking, InsertFormResponse } from "../drizzle/schema";
import { ENV } from './_core/env';

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
  return insertedBooking[0] || result;
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set(data).where(eq(bookings.id, id));
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
