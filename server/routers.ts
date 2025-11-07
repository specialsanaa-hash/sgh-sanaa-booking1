import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCampaigns, getCampaignById, createCampaign, getFormsByCampaign, getFormById, createForm, updateForm, deleteForm, getFormFields, createFormField, updateFormField, deleteFormField, getBookings, getBookingById, createBooking, updateBooking, deleteBooking, createFormResponse, getFormResponsesByBooking } from "./db";

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
        return createCampaign({
          name: input.name,
          description: input.description,
          createdBy: ctx.user.id,
        });
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
        return createForm({
          campaignId: input.campaignId,
          title: input.title,
          description: input.description,
          createdBy: ctx.user.id,
          isActive: 1,
        });
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), isActive: z.number().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateForm(id, data);
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteForm(input);
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
      .mutation(async ({ input }) => {
        return createFormField(input);
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), label: z.string().optional(), isRequired: z.number().optional(), placeholder: z.string().optional(), options: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateFormField(id, data);
      }),
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteFormField(input);
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
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      return deleteBooking(input);
    }),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "cancelled", "completed"]) }))
      .mutation(async ({ input }) => {
        return updateBooking(input.id, { status: input.status });
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
  })
});

export type AppRouter = typeof appRouter;
