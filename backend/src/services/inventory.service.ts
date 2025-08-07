import { prisma } from "../prisma";

export async function adjustStock(partId: string, delta: number, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: partId } });
    if (!part) throw Object.assign(new Error("Part not found"), { status: 404 });
    const newQty = part.quantityInStock + delta;
    if (newQty < 0) throw Object.assign(new Error("Insufficient stock"), { status: 400 });
    const updated = await tx.part.update({
      where: { id: part.id },
      data: {
        quantityInStock: newQty,
        inventoryValue: Number(part.unitCost) * newQty,
      },
    });
    await tx.auditLog.create({ data: { userId, action: "ADJUST_STOCK", entity: "Part", entityId: partId, details: { delta } } });
    return updated;
  });
}