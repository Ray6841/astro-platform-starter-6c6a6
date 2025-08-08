import { Request, Response } from "express";
import { prisma } from "../prisma";

export class ProjectsController {
  static async createProject(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { request_id, name } = req.body || {};
    const created = await prisma.project.create({ data: { tenantId, requestId: request_id ?? null, name: name || "New Project" } });
    res.status(201).json(created);
  }
  static async getProject(req: Request, res: Response) {
    const proj = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!proj) return res.status(404).json({ error: "NotFound", message: "Project not found" });
    res.json(proj);
  }
  static async addTask(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { name, assignee_id } = req.body || {};
    const task = await prisma.task.create({ data: { tenantId, projectId: req.params.id, type: "action", name: name || "Task", assigneeId: assignee_id || null, status: "open" } });
    res.status(201).json(task);
  }
  static async addDocument(_req: Request, res: Response) {
    res.status(201).json({ ok: true, upload: "use signed URL in real impl" });
  }
}