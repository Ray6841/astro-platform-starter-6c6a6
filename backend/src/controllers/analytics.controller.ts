import { Request, Response } from "express";
import { prisma } from "../prisma";

export class AnalyticsController {
  static async realTimeSpend(req: Request, res: Response) {
    const { group_by } = req.query as Record<string, string>;
    const spend = await prisma.spendTransaction.groupBy({ by: ["categoryId"], _sum: { amount: true } });
    res.json({ group_by: group_by || "category", data: spend });
  }
  static async processMetrics(_req: Request, res: Response) {
    res.json({ cycle_time_days: 7.2, approval_sla_breaches: 1, throughput_week: 42 });
  }
  static async roi(req: Request, res: Response) {
    const { project_id } = req.query as Record<string, string>;
    const proj = project_id ? await prisma.project.findUnique({ where: { id: project_id } }) : null;
    res.json({ project_id, savings: proj?.actualSavings || 0, costs: 0, roi_pct: 0 });
  }
}