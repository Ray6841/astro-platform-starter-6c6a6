import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const orderItemSchema = z.object({ partId: z.string(), quantity: z.number().int().positive() });
const createOrderSchema = z.object({ customer: z.string(), items: z.array(orderItemSchema).min(1) });

export async function listOrdersHandler(_req: Request, res: Response) {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: { include: { part: true } } } });
  res.json(orders);
}

export async function getOrderHandler(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: { include: { part: true } } } });
  if (!order) return res.status(404).json({ error: { message: "Not found" } });
  res.json(order);
}

export async function createOrderHandler(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const { customer, items } = parsed.data;
  const order = await prisma.order.create({
    data: {
      customer,
      items: {
        create: await Promise.all(items.map(async (it) => {
          const part = await prisma.part.findUnique({ where: { id: it.partId } });
          const unitPrice = Number(part?.unitCost || 0);
          return { partId: it.partId, quantity: it.quantity, unitPrice };
        })),
      },
    },
    include: { items: true },
  });
  res.status(201).json(order);
}

export async function picklistHandler(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: { include: { part: true } } } });
  if (!order) return res.status(404).json({ error: { message: "Not found" } });
  const picklist = order.items.map((it) => ({
    partNumber: it.part.partNumber,
    description: it.part.description,
    binNumber: it.part.binNumber,
    location: it.part.location,
    quantity: it.quantity,
    barcode: it.part.barcode,
  }));
  res.json({ orderId: order.id, customer: order.customer, items: picklist });
}

export async function fulfillOrderHandler(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ error: { message: "Not found" } });
  if (order.status === "FULFILLED") return res.status(400).json({ error: { message: "Order already fulfilled" } });

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const part = await tx.part.findUnique({ where: { id: item.partId } });
      if (!part) throw Object.assign(new Error("Part not found"), { status: 404 });
      if (part.quantityInStock < item.quantity) throw Object.assign(new Error("Insufficient stock"), { status: 400 });
      const newQty = part.quantityInStock - item.quantity;
      await tx.part.update({
        where: { id: part.id },
        data: { quantityInStock: newQty, inventoryValue: Number(part.unitCost) * newQty },
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { status: "FULFILLED" } });
    await tx.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "FULFILL_ORDER",
        entity: "Order",
        entityId: order.id,
        details: { items: order.items.map((i) => ({ partId: i.partId, quantity: i.quantity })) },
      },
    });
  });

  res.json({ ok: true });
}