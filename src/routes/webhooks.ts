import { Router, raw } from "express";
import { langgraphWebhookSchema } from "../schemas/request/webhooks.js";
import { processSessionSummary } from "../services/webhooks.service.js";
import { Webhook } from "svix";
import { createUser } from "../services/user.service.js";

export const webhooksRouter = Router();

webhooksRouter.post("/evaluations", async (req, res) => {
  try {
    const payload = langgraphWebhookSchema.parse(req.body);

    if (payload.status === "success" && payload.values && payload.values.session_summary) {
      await processSessionSummary(payload);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(200).json({ success: true });
  }
});

webhooksRouter.post("/clerk", raw({ type: "application/json" }), async (req, res, next) => {
  try {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables.");
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      res.status(400).json({ error: "Missing svix headers" });
      return;
    }

    const wh = new Webhook(secret);
    let event: any;
    try {
      event = wh.verify(req.body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    const eventType = event.type;
    const data = event.data;

    if (eventType === "user.created") {
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown User";
      const email = data.email_addresses?.[0]?.email_address;
      await createUser({
        clerkUserId: data.id,
        name: name,
        email: email,
      });
      console.log(`Successfully created user ${data.id} via webhook.`);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
})
