import { Request, Response } from "express";
import { prisma } from "../prisma";

export class WorkflowsController {
  static async createDefinition(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { name, version = 1, definition } = req.body;
    const created = await prisma.workflowDefinition.create({ data: { tenantId, name, version, definition, isActive: false } });
    res.status(201).json(created);
  }
  static async getDefinition(req: Request, res: Response) {
    const def = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
    if (!def) return res.status(404).json({ error: "NotFound", message: "Workflow not found" });
    res.json(def);
  }
  static async deployDefinition(req: Request, res: Response) {
    const updated = await prisma.workflowDefinition.update({ where: { id: req.params.id }, data: { isActive: true } });
    res.json(updated);
  }
  static async startInstance(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { context = {} } = req.body || {};
    const instance = await prisma.workflowInstance.create({ data: { tenantId, definitionId: req.params.id, status: "running", context } });
    res.status(201).json(instance);
  }
  static async getInstance(req: Request, res: Response) {
    const inst = await prisma.workflowInstance.findUnique({ where: { id: req.params.instanceId }, include: { tasks: true } });
    if (!inst) return res.status(404).json({ error: "NotFound", message: "Instance not found" });
    res.json(inst);
  }
}