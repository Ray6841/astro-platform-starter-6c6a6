import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function listAuditHandler(_req: Request, res: Response) {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: true } });
  res.json(logs);
}