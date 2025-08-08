import { Request, Response } from "express";
import { prisma } from "../prisma";

export class CategoriesController {
  static async createCategory(req: Request, res: Response) {
    const tenantId = (req.headers["x-tenant-id"] as string) || "tenant-demo";
    const { name, parent_id } = req.body || {};
    const created = await prisma.category.create({ data: { tenantId, name, parentId: parent_id ?? null } });
    res.status(201).json(created);
  }
  static async getCategory(req: Request, res: Response) {
    const cat = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!cat) return res.status(404).json({ error: "NotFound", message: "Category not found" });
    res.json(cat);
  }
  static async getCategorySpend(req: Request, res: Response) {
    const { period = "MTD" } = req.query as Record<string, string>;
    const total = await prisma.spendTransaction.aggregate({ _sum: { amount: true }, where: { categoryId: req.params.id } });
    res.json({ category_id: req.params.id, period, amount: total._sum.amount || 0 });
  }
  static async setKpis(_req: Request, res: Response) {
    res.json({ ok: true });
  }
}