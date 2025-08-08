import { Request as ExRequest, Response } from "express";
import { prisma } from "../prisma";

export class IntakeController {
  static async aiGenerateForm(req: ExRequest, res: Response) {
    const { title = "New Request", description = "", hints = [] } = req.body || {};
    const form = await prisma.intakeForm.create({
      data: {
        tenantId: req.headers["x-tenant-id"] as string || "tenant-demo",
        title,
        schema: {
          type: "object",
          properties: {
            description: { type: "string", title: "Description" },
            estimated_spend: { type: "number", title: "Estimated Spend" },
            department: { type: "string", title: "Department" },
            region: { type: "string", title: "Region" }
          },
          required: ["description"]
        },
        uiSchema: { }
      }
    });
    res.json({ form_id: form.id, schema: form.schema, ui_schema: form.uiSchema });
  }

  static async getForm(req: ExRequest, res: Response) {
    const form = await prisma.intakeForm.findUnique({ where: { id: req.params.formId } });
    if (!form) return res.status(404).json({ error: "NotFound", message: "Form not found" });
    res.json(form);
  }

  static async createRequest(req: ExRequest, res: Response) {
    const { form_id, data, metadata = {} } = req.body || {};
    const created = await prisma.request.create({
      data: {
        tenantId: req.headers["x-tenant-id"] as string || "tenant-demo",
        formId: form_id ?? null,
        data: data || {},
        status: "submitted",
        region: metadata.region || null,
        department: metadata.department || null,
        estimatedSpend: metadata.estimated_spend || null,
        riskScore: metadata.risk_score || null
      }
    });
    res.status(201).json({ request_id: created.id, status: created.status });
  }

  static async getRequest(req: ExRequest, res: Response) {
    const r = await prisma.request.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ error: "NotFound", message: "Request not found" });
    res.json(r);
  }

  static async listRequests(req: ExRequest, res: Response) {
    const { status, assignee } = req.query as Record<string, string>;
    const list = await prisma.request.findMany({
      where: {
        status: status as any || undefined,
        assigneeId: assignee === "me" ? (req as any).user?.id : assignee || undefined
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(list);
  }
}