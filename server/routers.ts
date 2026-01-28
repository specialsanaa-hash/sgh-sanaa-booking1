import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCampaigns, getCampaignById, createCampaign, getFormsByCampaign, getFormById, createForm, updateForm, deleteForm, getFormFields, createFormField, updateFormField, deleteFormField, getBookings, getBookingById, createBooking, updateBooking, deleteBooking, createFormResponse, getFormResponsesByBooking, createActivityLog, getActivityLogs } from "./db";
import { webhookRouter } from "./routers/webhook";
import { metaRouter } from "./routers/meta";
import { doctorsRouter } from "./routers/doctors";
import { staticPagesRouter } from "./routers/staticPages";
import { doctorBookingsRouter } from "./routers/doctorBookings";

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
});

export type AppRouter = typeof appRouter;
