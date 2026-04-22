import { COOKIE_NAME } from "@shared/const";
import { users } from "../drizzle/schema";
import { messages } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCampaigns, getCampaignById, createCampaign, getFormsByCampaign, getFormById, createForm, updateForm, deleteForm, getFormFields, createFormField, updateFormField, deleteFormField, getBookings, getBookingById, createBooking, updateBooking, deleteBooking, createFormResponse, getFormResponsesByBooking, createActivityLog, getActivityLogs } from "./db";
import { sendBookingConfirmedMessage, sendBookingCancelledMessage, sendBookingCompletedMessage } from "./services/autoMessages";
import { eq } from "drizzle-orm";
import { webhookRouter } from "./routers/webhook";
import { metaRouter } from "./routers/meta";
import { doctorsRouter } from "./routers/doctors";
import { staticPagesRouter } from "./routers/staticPages";
import { doctorBookingsRouter } from "./routers/doctorBookings";
import { patientsRouter } from "./routers/patients";
import { messagingGatewayRouter } from "./routers/messaging-gateway";
import { messagingRouter } from "./routers/messaging";
import { socketioRouter } from "./routers/socketio";
import { messageSettings } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    createTestUser: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'فشل الاتصال بقاعدة البيانات',
          });
        }

        const openId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          await db.insert(users).values({
            openId,
            name: input.name,
            email: input.email,
            loginMethod: 'test',
            role: 'admin',
          });

          return {
            success: true,
            message: 'تم إنشاء مستخدم الاختبار بنجاح',
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'فشل إنشاء المستخدم',
          });
        }
      }),
    getAllUsers: adminProcedure.query(async () => {
      const { getAllUsers } = await import('./db');
      return getAllUsers();
    }),
    createUser: adminProcedure
      .input(z.object({
        username: z.string().min(1).optional(),
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["user", "admin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createUser } = await import('./db');
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        return createUser({
          username: input.username || input.email || `user_${Date.now()}`,
          passwordHash: hashedPassword,
          name: input.name,
          email: input.email,
          role: input.role || 'user',
          loginMethod: 'local',
        });
      }),
    updateUser: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateUser } = await import('./db');
        const { id, ...data } = input;
        return updateUser(id, data);
      }),
    deleteUser: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deleteUser } = await import('./db');
        return deleteUser(input);
      }),
  }),

  campaigns: router({
    list: publicProcedure.query(async () => {
      const campaigns = await getCampaigns();
      return campaigns;
    }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getCampaignById(input);
    }),
    create: adminProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCampaign({
          name: input.name,
          description: input.description,
          createdBy: ctx.user.id,
        });
        const campaignId = (result as any).insertId || 0;

        await createActivityLog({
          userId: ctx.user.id,
          action: 'CREATE_CAMPAIGN',
          details: `تم إنشاء حملة جديدة: ${input.name}`,
          targetId: campaignId,
          targetType: 'campaign',
        });

        return result;
      }),
  }),

  forms: router({
    listByCampaign: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getFormsByCampaign(input);
    }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getFormById(input);
    }),
    create: adminProcedure
      .input(
        z.object({
          campaignId: z.number(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createForm({
          campaignId: input.campaignId,
          title: input.title,
          description: input.description,
          createdBy: ctx.user.id,
          isActive: 1,
        });
        const formId = (result as any).insertId || 0;

        await createActivityLog({
          userId: ctx.user.id,
          action: 'CREATE_FORM',
          details: `تم إنشاء نموذج جديد: ${input.title} للحملة ${input.campaignId}`,
          targetId: formId,
          targetType: 'form',
        });

        return result;
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await updateForm(id, data);

        await createActivityLog({
          userId: ctx.user.id,
          action: 'UPDATE_FORM',
          details: `تم تحديث النموذج رقم ${id}`,
          targetId: id,
          targetType: 'form',
        });

        return result;
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      const result = await deleteForm(input);

      await createActivityLog({
        userId: ctx.user.id,
        action: 'DELETE_FORM',
        details: `تم حذف النموذج رقم ${input}`,
        targetId: input,
        targetType: 'form',
      });

      return result;
    }),
  }),

  formFields: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getFormFields(input);
    }),
    create: adminProcedure
      .input(
        z.object({
          formId: z.number(),
          fieldName: z.string(),
          fieldType: z.enum(["text", "email", "phone", "number", "select", "textarea", "date"]),
          label: z.string(),
          isRequired: z.number().optional(),
          placeholder: z.string().optional(),
          options: z.string().optional(),
          order: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createFormField(input);

        await createActivityLog({
          userId: ctx.user.id,
          action: 'CREATE_FORM_FIELD',
          details: `تم إنشاء حقل جديد ${input.fieldName} للنموذج ${input.formId}`,
          targetId: input.formId,
          targetType: 'form',
        });

        return result;
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), label: z.string().optional(), isRequired: z.number().optional(), placeholder: z.string().optional(), options: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await updateFormField(id, data);

        await createActivityLog({
          userId: ctx.user.id,
          action: 'UPDATE_FORM_FIELD',
          details: `تم تحديث الحقل رقم ${id}`,
          targetId: id,
          targetType: 'form',
        });

        return result;
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      const result = await deleteFormField(input);

      await createActivityLog({
        userId: ctx.user.id,
        action: 'DELETE_FORM_FIELD',
        details: `تم حذف الحقل رقم ${input}`,
        targetId: input,
        targetType: 'form',
      });

      return result;
    }),
  }),

  bookings: router({
    list: adminProcedure
      .input(z.object({ formId: z.number().optional(), campaignId: z.number().optional() }))
      .query(async ({ input }) => {
        return getBookings(input.formId, input.campaignId);
      }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getBookingById(input);
    }),
    create: publicProcedure
      .input(
        z.object({
          formId: z.number(),
          campaignId: z.number(),
          patientName: z.string(),
          patientEmail: z.string().email().optional().or(z.literal("")),
          patientPhone: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createBooking({
          ...input,
          status: "pending",
        });
        return result;
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      const result = await deleteBooking(input);

      await createActivityLog({
        userId: ctx.user.id,
        action: 'DELETE_BOOKING',
        details: `تم حذف الحجز رقم ${input}`,
        targetId: input,
        targetType: 'booking',
      });

      return result;
    }),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled", "completed"]) }))
      .mutation(async ({ input, ctx }) => {
        const result = await updateBooking(input.id, { status: input.status });

        // Get booking data to send auto message
        const booking = await getBookingById(input.id);
        if (booking) {
          const bookingData = booking as any;
          
          // Send auto messages based on new status
          if (input.status === "confirmed") {
            await sendBookingConfirmedMessage(
              bookingData.patientName,
              new Date(bookingData.appointmentDate || new Date()).toLocaleDateString("ar-SA"),
              input.id,
              "SMS"
            );
          } else if (input.status === "cancelled") {
            await sendBookingCancelledMessage(
              bookingData.patientName,
              input.id,
              "SMS"
            );
          } else if (input.status === "completed") {
            await sendBookingCompletedMessage(
              bookingData.patientName,
              input.id,
              "SMS"
            );
          }
        }

        await createActivityLog({
          userId: ctx.user.id,
          action: 'UPDATE_BOOKING_STATUS',
          details: `تم تحديث حالة الحجز رقم ${input.id} إلى ${input.status}`,
          targetId: input.id,
          targetType: 'booking',
        });

        return result;
      }),
  }),

  formResponses: router({
    create: publicProcedure
      .input(
        z.object({
          bookingId: z.number(),
          fieldId: z.number(),
          value: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return createFormResponse(input);
      }),
    getByBooking: publicProcedure.input(z.number()).query(async ({ input }) => {
      return getFormResponsesByBooking(input);
    }),
  }),

  activityLogs: router({
    list: adminProcedure.query(async () => {
      return getActivityLogs();
    }),
  }),

  webhook: webhookRouter,
  meta: metaRouter,
  doctors: doctorsRouter,
  staticPages: staticPagesRouter,
  doctorBookings: doctorBookingsRouter,
  patients: patientsRouter,
  messagingGateway: messagingGatewayRouter,
  messaging: messagingRouter,
  messages: router({
    getAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(100);
        return result;
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    }),

    send: protectedProcedure
      .input(z.object({
        messageText: z.string(),
        messageType: z.enum(["SMS", "WhatsApp"]),
        relatedBookingId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        try {
          const result = await db.insert(messages).values({
            messageText: input.messageText,
            messageType: input.messageType,
            direction: "sent",
            status: "sent",
            relatedBookingId: input.relatedBookingId,
          });
          return { success: true, id: (result as any).insertId };
        } catch (error) {
          console.error("Error sending message:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send message" });
        }
      }),

    receive: protectedProcedure
      .input(z.object({
        messageText: z.string(),
        messageType: z.enum(["SMS", "WhatsApp"]),
        externalId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        try {
          const result = await db.insert(messages).values({
            messageText: input.messageText,
            messageType: input.messageType,
            direction: "received",
            status: "delivered",
            externalId: input.externalId,
          });
          return { success: true, id: (result as any).insertId };
        } catch (error) {
          console.error("Error receiving message:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to receive message" });
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        status: z.enum(["pending", "sent", "delivered", "failed", "read"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        try {
          await db.update(messages).set({ status: input.status }).where(eq(messages.id, input.messageId));
          return { success: true };
        } catch (error) {
          console.error("Error updating message status:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update status" });
        }
      }),

    getSettings: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      try {
        const result = await db.select().from(messageSettings).limit(1);
        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error("Error fetching message settings:", error);
        return null;
      }
    }),

    saveSettings: adminProcedure
      .input(z.object({
        platformUrl: z.string().url(),
        socketUrl: z.string().url(),
        apiKey: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        }

        try {
          const existing = await db.select().from(messageSettings).limit(1);
          if (existing.length > 0) {
            await db.update(messageSettings).set(input).where(eq(messageSettings.id, existing[0].id));
          } else {
            await db.insert(messageSettings).values(input);
          }
          return { success: true };
        } catch (error) {
          console.error("Error saving message settings:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save settings" });
        }
      }),
  }),
  socketio: socketioRouter,
});

export type AppRouter = typeof appRouter;
