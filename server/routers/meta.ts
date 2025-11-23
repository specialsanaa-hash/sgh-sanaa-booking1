import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createBooking, createFormResponse } from "../db";
// FormFieldType is a string literal type from the schema
import { getFormFields } from "../db";
import { getCampaignById } from "../db";
import crypto from "crypto";
import { ENV } from "../_core/env";

// Define the verification token from environment variables
const META_VERIFY_TOKEN = ENV.metaVerifyToken;

export const metaRouter = router({
  // Endpoint for Meta Webhook verification (GET request)
  verifyWebhook: publicProcedure
    .input(z.object({
      "hub.mode": z.string(),
      "hub.verify_token": z.string(),
      "hub.challenge": z.string(),
    }))
    .query(({ input }) => {
      const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = input;

      if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
        console.log("[Meta Webhook] Verified subscription.");
        // Respond with the challenge token to complete verification
        return challenge;
      }

      // If verification fails, return an error or throw
      throw new Error("Meta Webhook verification failed.");
    }),

  // Endpoint for receiving Meta Webhook events (POST request)
  handleWebhook: publicProcedure
    .input(z.object({
      object: z.string(),
      entry: z.array(z.object({
        id: z.string(),
        time: z.number(),
        changes: z.array(z.object({
          value: z.object({
            leadgen_id: z.number(),
            form_id: z.number(),
            adgroup_id: z.number().optional(),
            ad_id: z.number().optional(),
            page_id: z.number(),
            created_time: z.number(),
            field_data: z.array(z.object({
              name: z.string(),
              values: z.array(z.string()),
            })),
          }),
          field: z.string(),
        })),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Verify the request signature (Optional but highly recommended for security)
      const signature = ctx.req.headers["x-hub-signature-256"];
      if (ENV.metaAppSecret && signature) {
        const expectedSignature = "sha256=" + crypto.createHmac("sha256", ENV.metaAppSecret).update(JSON.stringify(ctx.req.body)).digest("hex");
        if (signature !== expectedSignature) {
          console.error("[Meta Webhook] Signature mismatch. Request rejected.");
          throw new Error("Signature mismatch");
        }
      }

      // 2. Process the lead data
      for (const entry of input.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadData = change.value;
            const formId = leadData.form_id;
            
            // Find the form and its fields
            const formFields = await getFormFields(formId);
            if (!formFields || formFields.length === 0) {
              console.warn(`[Meta Webhook] Form ID ${formId} not found or has no fields.`);
              continue;
            }

            // Extract core booking data
            let patientName = "";
            let patientPhone = "";
            let patientEmail = "";
            
            // Map field data to booking and response data
            const responseData: { fieldId: number, value: string }[] = [];
            
            for (const field of leadData.field_data) {
              const fieldName = field.name;
              const fieldValue = field.values[0] || "";
              
              const matchingField = formFields.find(f => f.fieldName === fieldName);
              
              if (matchingField) {
                // Map core fields
                if (matchingField.fieldType === "text" && fieldName.toLowerCase().includes("name")) {
                  patientName = fieldValue;
                } else if (matchingField.fieldType === "phone") {
                  patientPhone = fieldValue;
                } else if (matchingField.fieldType === "email") {
                  patientEmail = fieldValue;
                }
                
                // Collect all responses
                responseData.push({
                  fieldId: matchingField.id,
                  value: fieldValue,
                });
              }
            }

            // Basic validation
            if (!patientName || !patientPhone) {
              console.error("[Meta Webhook] Missing required fields (Name or Phone). Lead rejected.");
              continue;
            }

            // Find the campaign ID associated with the form (assuming form has campaignId)
            const form = await getCampaignById(formFields[0].formId); // Assuming formFields[0].formId is the form ID
            const campaignId = form?.id;
            
            if (!campaignId) {
                console.error(`[Meta Webhook] Could not find campaign for form ID ${formId}. Lead rejected.`);
                continue;
            }

            // 3. Create the booking
            const newBooking = await createBooking({
              formId: formId,
              campaignId: campaignId,
              patientName: patientName,
              patientPhone: patientPhone,
              patientEmail: patientEmail,
              status: "pending", // New leads are always pending
            });

            // 4. Create form responses
            if (newBooking.id) {
              for (const response of responseData) {
                await createFormResponse({
                  bookingId: newBooking.id,
                  fieldId: response.fieldId,
                  value: response.value,
                });
              }
            }
            
            console.log(`[Meta Webhook] Successfully processed new lead (Booking ID: ${newBooking.id})`);
          }
        }
      }

      // Meta expects a 200 OK response quickly
      return { success: true };
    }),
});
