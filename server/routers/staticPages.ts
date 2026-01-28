import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  createStaticPage, 
  getStaticPages, 
  getStaticPageBySlug, 
  getStaticPageById, 
  updateStaticPage, 
  deleteStaticPage 
} from "../db";
import { TRPCError } from "@trpc/server";

export const staticPagesRouter = router({
  // Get all published static pages (public)
  list: publicProcedure.query(async () => {
    return await getStaticPages();
  }),

  // Get static page by slug (public) - for individual page views
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await getStaticPageBySlug(input.slug);
      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }
      return page;
    }),

  // Get static page by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const page = await getStaticPageById(input.id);
      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }
      return page;
    }),

  // Create static page (admin only)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      image: z.string().optional(),
      isPublished: z.number().optional(),
      isVisible: z.number().optional(),
      order: z.number().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      canonicalUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create pages",
        });
      }

      return await createStaticPage({
        ...input,
        createdBy: ctx.user.id,
        isPublished: input.isPublished ?? 1,
        isVisible: input.isVisible ?? 1,
        order: input.order ?? 0,
      });
    }),

  // Update static page (admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      image: z.string().optional(),
      isPublished: z.number().optional(),
      isVisible: z.number().optional(),
      order: z.number().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.string().optional(),
      canonicalUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update pages",
        });
      }

      const { id, ...data } = input;
      return await updateStaticPage(id, data);
    }),

  // Delete static page (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete pages",
        });
      }

      return await deleteStaticPage(input.id);
    }),
});
