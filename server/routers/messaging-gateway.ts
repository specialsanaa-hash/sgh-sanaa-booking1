import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, count } from "drizzle-orm";
import { getDb } from "../db";
import { messages } from "../../drizzle/schema";

/**
 * Messaging Gateway Integration Router
 * APIs for integrating with the external Messaging Gateway application
 */

export const messagingGatewayRouter = router({
  // Webhook to receive messages from the Messaging Gateway app
  receiveMessage: publicProcedure
    .input(
      z.object({
        messageText: z.string(),
        messageType: z.enum(["SMS", "WhatsApp"]),
        timestamp: z.string(),
        externalId: z.string(),
        senderName: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Store the message in the database
        await db.insert(messages).values({
          direction: "received",
          messageText: input.messageText,
          messageType: input.messageType,
          status: "read",
          externalId: input.externalId,
          metadata: input.metadata || null,
        });

        return {
          success: true,
          message: "Message received successfully",
        };
      } catch (error) {
        console.error("[Messaging Gateway] Error receiving message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive message",
        });
      }
    }),

  // Send a message through the Messaging Gateway
  sendMessage: protectedProcedure
    .input(
      z.object({
        messageText: z.string(),
        messageType: z.enum(["SMS", "WhatsApp"]),
        recipientName: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        // Store the message in the database
        const result = await db.insert(messages).values({
          direction: "sent",
          messageText: input.messageText,
          messageType: input.messageType,
          status: "pending",
          metadata: input.metadata || null,
        });

        return {
          success: true,
          message: "Message sent successfully",
          messageId: (result as any).insertId || 0,
        };
      } catch (error) {
        console.error("[Messaging Gateway] Error sending message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  // Get message history
  getMessageHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        messageType: z.enum(["SMS", "WhatsApp"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        const conditions: any[] = [];
        
        if (input.messageType) {
          conditions.push(eq(messages.messageType, input.messageType));
        }

        let query = db.select().from(messages) as any;

        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }

        const result = await query
          .orderBy(desc(messages.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          messages: result,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error("[Messaging Gateway] Error getting message history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get message history",
        });
      }
    }),

  // Get message statistics
  getMessageStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const totalMessages = await db
        .select({ count: count() })
        .from(messages);

      const sentMessages = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.direction, "sent"));

      const receivedMessages = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.direction, "received"));

      const smsMessages = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.messageType, "SMS"));

      const whatsappMessages = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.messageType, "WhatsApp"));

      return {
        total: totalMessages[0]?.count || 0,
        sent: sentMessages[0]?.count || 0,
        received: receivedMessages[0]?.count || 0,
        sms: smsMessages[0]?.count || 0,
        whatsapp: whatsappMessages[0]?.count || 0,
      };
    } catch (error) {
      console.error("[Messaging Gateway] Error getting message stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get message statistics",
      });
    }
  }),

  // Update message status
  updateMessageStatus: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        status: z.enum(["pending", "sent", "delivered", "failed", "read"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          });
        }

        await db
          .update(messages)
          .set({ status: input.status })
          .where(eq(messages.id, input.messageId));

        return {
          success: true,
          message: "Message status updated successfully",
        };
      } catch (error) {
        console.error("[Messaging Gateway] Error updating message status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update message status",
        });
      }
    }),

  // Health check endpoint
  healthCheck: publicProcedure.query(async () => {
    return {
      status: "healthy",
      timestamp: new Date(),
      version: "1.0.0",
    };
  }),
});
