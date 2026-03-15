import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { patients, appointments, medicalRecords, messages, invoices, prescriptions, InsertPatient, Patient, Booking } from "../../drizzle/schema";
import { bookings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const patientsRouter = router({
  // الحصول على بيانات المريض الحالي
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    try {
      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, ctx.user.id))
        .limit(1);

      return patient.length > 0 ? patient[0] : null;
    } catch (error) {
      console.error("[Patients] Error getting profile:", error);
      return null;
    }
  }),

  // إنشاء ملف المريض (عند التسجيل الأول)
  createProfile: protectedProcedure
    .input(
      z.object({
        nationalId: z.string().optional(),
        phone: z.string(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        bloodType: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        insuranceProvider: z.string().optional(),
        insuranceNumber: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // التحقق من عدم وجود ملف مريض سابق
        const existingPatient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (existingPatient.length > 0) {
          throw new Error("Patient profile already exists");
        }

        const result = await db.insert(patients).values({
          userId: ctx.user.id,
          nationalId: input.nationalId,
          phone: input.phone,
          dateOfBirth: input.dateOfBirth,
          gender: input.gender,
          bloodType: input.bloodType,
          address: input.address,
          city: input.city,
          emergencyContact: input.emergencyContact,
          emergencyPhone: input.emergencyPhone,
          insuranceProvider: input.insuranceProvider,
          insuranceNumber: input.insuranceNumber,
        });

        return { success: true, patientId: (result as any).insertId };
      } catch (error) {
        console.error("[Patients] Error creating profile:", error);
        throw error;
      }
    }),

  // تحديث بيانات المريض
  updateProfile: protectedProcedure
    .input(
      z.object({
        nationalId: z.string().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.date().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        bloodType: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        allergies: z.string().optional(),
        chronicDiseases: z.string().optional(),
        currentMedications: z.string().optional(),
        insuranceProvider: z.string().optional(),
        insuranceNumber: z.string().optional(),
        profileImage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) {
          throw new Error("Patient profile not found");
        }

        const result = await db
          .update(patients)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(patients.userId, ctx.user.id));

        return { success: true };
      } catch (error) {
        console.error("[Patients] Error updating profile:", error);
        throw error;
      }
    }),

  // الحصول على المواعيد الخاصة بالمريض
  getAppointments: protectedProcedure
    .input(
      z.object({
        status: z.enum(["scheduled", "completed", "cancelled", "no-show"]).optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) return [];

        let query = db
          .select()
          .from(appointments)
          .where(eq(appointments.patientId, patient[0].id));

        if (input.status) {
          query = db
            .select()
            .from(appointments)
            .where(
              and(
                eq(appointments.patientId, patient[0].id),
                eq(appointments.status, input.status)
              )
            );
        }

        const result = await query.limit(input.limit).offset(input.offset);
        return result;
      } catch (error) {
        console.error("[Patients] Error getting appointments:", error);
        return [];
      }
    }),

  // الحصول على السجل الطبي
  getMedicalRecords: protectedProcedure
    .input(
      z.object({
        recordType: z.enum(["diagnosis", "prescription", "lab_report", "imaging", "procedure", "note"]).optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) return [];

        let query = db
          .select()
          .from(medicalRecords)
          .where(
            and(
              eq(medicalRecords.patientId, patient[0].id),
              eq(medicalRecords.isVisible, 1)
            )
          );

        if (input.recordType) {
          query = db
            .select()
            .from(medicalRecords)
            .where(
              and(
                eq(medicalRecords.patientId, patient[0].id),
                eq(medicalRecords.recordType, input.recordType),
                eq(medicalRecords.isVisible, 1)
              )
            );
        }

        const result = await query.limit(input.limit).offset(input.offset);
        return result;
      } catch (error) {
        console.error("[Patients] Error getting medical records:", error);
        return [];
      }
    }),

  // الحصول على الرسائل
  getMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) return [];

        const result = await db
          .select()
          .from(messages)
          .where(eq(messages.relatedPatientId, patient[0].id))
          .limit(input.limit)
          .offset(input.offset);

        return result;
      } catch (error) {
        console.error("[Patients] Error getting messages:", error);
        return [];
      }
    }),

  // إرسال رسالة للطبيب
  sendMessage: protectedProcedure
    .input(
      z.object({
        doctorId: z.number(),
        subject: z.string(),
        content: z.string(),
        attachmentUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) {
          throw new Error("Patient profile not found");
        }

        const result = await db.insert(messages).values({
          relatedPatientId: patient[0].id,
          messageText: input.content,
          messageType: "SMS",
          direction: "sent",
          status: "sent",
        });

        return { success: true, messageId: (result as any).insertId };
      } catch (error) {
        console.error("[Patients] Error sending message:", error);
        throw error;
      }
    }),

  // الحصول على الفواتير
  getInvoices: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) return [];

        let query = db
          .select()
          .from(invoices)
          .where(eq(invoices.patientId, patient[0].id));

        if (input.status) {
          query = db
            .select()
            .from(invoices)
            .where(
              and(
                eq(invoices.patientId, patient[0].id),
                eq(invoices.status, input.status)
              )
            );
        }

        const result = await query.limit(input.limit).offset(input.offset);
        return result;
      } catch (error) {
        console.error("[Patients] Error getting invoices:", error);
        return [];
      }
    }),

  // الحصول على الوصفات الطبية
  getPrescriptions: protectedProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) return [];

        let query = db
          .select()
          .from(prescriptions)
          .where(eq(prescriptions.patientId, patient[0].id));

        if (input.isActive !== undefined) {
          query = db
            .select()
            .from(prescriptions)
            .where(
              and(
                eq(prescriptions.patientId, patient[0].id),
                eq(prescriptions.isActive, input.isActive ? 1 : 0)
              )
            );
        }

        const result = await query.limit(input.limit).offset(input.offset);
        return result;
      } catch (error) {
        console.error("[Patients] Error getting prescriptions:", error);
        return [];
      }
    }),

  // إلغاء موعد
  cancelAppointment: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const patient = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, ctx.user.id))
          .limit(1);

        if (patient.length === 0) {
          throw new Error("Patient profile not found");
        }

        // التحقق من أن الموعد ينتمي للمريض
        const appointment = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.id, input),
              eq(appointments.patientId, patient[0].id)
            )
          )
          .limit(1);

        if (appointment.length === 0) {
          throw new Error("Appointment not found");
        }

        await db
          .update(appointments)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(appointments.id, input));

        return { success: true };
      } catch (error) {
        console.error("[Patients] Error cancelling appointment:", error);
        throw error;
      }
    }),
});
