import express, { Router } from "express";
import { langgraphWebhookSchema } from "../schemas/request/webhooks.js";
import { processSessionSummary } from "../services/webhooks.service.js";
import { createUser } from "../services/user.service.js";

export const webhooksRouter = Router();

webhooksRouter.post("/evaluations", express.json(), async (req, res) => {
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

webhooksRouter.post("/clerk", express.json(), async (req, res, next) => {
  try {
    const eventType = req.body.type;
    const data = req.body.data;

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
});
