import { Router } from "express";
import { langgraphWebhookSchema } from "../schemas/request/webhooks.js";
import { processSessionSummary } from "../services/webhooks.service.js";

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
