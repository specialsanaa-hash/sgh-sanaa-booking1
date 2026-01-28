import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  createDoctorBooking, 
  getDoctorBookings, 
  getDoctorBookingById, 
  updateDoctorBooking, 
  deleteDoctorBooking 
} from "../db";
import { TRPCError } from "@trpc/server";

export const doctorBookingsRouter = router({
  // Create doctor booking (public)
  create: publicProcedure
    .input(z.object({
      doctorId: z.number(),
      patientName: z.string().min(1),
      patientEmail: z.string().email().optional(),
      patientPhone: z.string().min(1),
      appointmentDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await createDoctorBooking({
        ...input,
        status: "pending",
      });
    }),

  // Get doctor bookings (admin only)
  list: protectedProcedure
    .input(z.object({ doctorId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view bookings",
        });
      }

      return await getDoctorBookings(input.doctorId);
    }),

  // Get doctor booking by ID (admin only)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view booking details",
        });
      }

      const booking = await getDoctorBookingById(input.id);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }
      return booking;
    }),

  // Update doctor booking status (admin only)
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update bookings",
        });
      }

      return await updateDoctorBooking(input.id, { status: input.status });
    }),

  // Delete doctor booking (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete bookings",
        });
      }

      return await deleteDoctorBooking(input.id);
    }),
});
