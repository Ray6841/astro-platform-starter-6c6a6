import { Request, Response } from "express";
import { prisma } from "../prisma";

export class IntegrationsController {
  static async registerConnector(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { provider, auth, settings } = req.body || {};
    const c = await prisma.connector.create({ data: { tenantId, provider, auth, settings, status: "connected" } });
    res.status(201).json(c);
  }
  static async createWebhookSub(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { event_type, target_url, secret } = req.body || {};
    const w = await prisma.webhookSubscription.create({ data: { tenantId, eventType: event_type, targetUrl: target_url, secret } });
    res.status(201).json(w);
  }
  static async inboundWebhook(req: Request, res: Response) {
    const { provider } = req.params;
    // In real impl: verify signature
    res.status(202).json({ received: true, provider, event: req.body?.event });
  }
}