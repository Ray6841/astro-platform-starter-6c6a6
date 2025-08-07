import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function dashboardHandler(_req: Request, res: Response) {
  const [totalValueAgg, lowStockCount, monthly] = await Promise.all([
    prisma.part.aggregate({ _sum: { inventoryValue: true } }),
    prisma.part.count({ where: { quantityInStock: { lt: prisma.part.fields.reorderLevel } } }).catch(async () => {
      // Fallback when fields cannot be referenced like above (older Prisma). Compute manually.
      const low = await prisma.part.findMany();
      return low.filter((p: any) => p.quantityInStock < (p.reorderLevel ?? 0)).length;
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }).catch(async () => {
      const all = await prisma.order.findMany();
      return [
        { status: "FULFILLED", _count: { _all: all.filter((o) => o.status === "FULFILLED").length } },
        { status: "PENDING", _count: { _all: all.filter((o) => o.status !== "FULFILLED").length } },
      ];
    }),
  ]);

  const totalValue = Number(totalValueAgg._sum.inventoryValue || 0);
  const fulfilled = (monthly as any[]).find((m) => m.status === "FULFILLED")?._count._all || 0;
  const pending = (monthly as any[]).find((m) => m.status !== "FULFILLED")?._count._all || 0;
  const fulfillmentRate = fulfilled + pending > 0 ? Math.round((fulfilled / (fulfilled + pending)) * 100) : 0;

  res.json({ totalStockValue: totalValue, lowStockCount, monthlyOrders: fulfilled + pending, fulfillmentRate });
}

export async function reorderSuggestionsHandler(_req: Request, res: Response) {
  const parts = await prisma.part.findMany({});
  const suggestions = parts
    .filter((p: any) => p.quantityInStock <= (p.reorderLevel ?? 0))
    .map((p) => ({
      partId: p.id,
      partNumber: p.partNumber,
      reorderLevel: p.reorderLevel,
      quantityInStock: p.quantityInStock,
      suggestedOrderQty: Math.max((p.reorderLevel ?? 0) * 2 - p.quantityInStock, 1),
      supplierId: p.supplierId,
      leadTimeDays: p.leadTimeDays,
    }));
  res.json({ items: suggestions });
}