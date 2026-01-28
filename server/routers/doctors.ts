import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  createDoctor, 
  getDoctors, 
  getDoctorBySlug, 
  getDoctorById, 
  updateDoctor, 
  deleteDoctor 
} from "../db";
import { TRPCError } from "@trpc/server";

export const doctorsRouter = router({
  // Get all active doctors (public)
  list: publicProcedure.query(async () => {
    return await getDoctors();
  }),

  // Get doctor by slug (public) - for individual doctor pages
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const doctor = await getDoctorBySlug(input.slug);
      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }
      return doctor;
    }),

  // Get doctor by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const doctor = await getDoctorById(input.id);
      if (!doctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }
      return doctor;
    }),

  // Create doctor (admin only)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      specialty: z.string().min(1),
      bio: z.string().optional(),
      image: z.string().optional(),
      experience: z.string().optional(),
      qualifications: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      slug: z.string().min(1),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create doctors",
        });
      }

      return await createDoctor({
        ...input,
        createdBy: ctx.user.id,
        isActive: 1,
      });
    }),

  // Update doctor (admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      specialty: z.string().optional(),
      bio: z.string().optional(),
      image: z.string().optional(),
      experience: z.string().optional(),
      qualifications: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      slug: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isActive: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update doctors",
        });
      }

      const { id, ...data } = input;
      return await updateDoctor(id, data);
    }),

  // Delete doctor (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete doctors",
        });
      }

      return await deleteDoctor(input.id);
    }),
});
