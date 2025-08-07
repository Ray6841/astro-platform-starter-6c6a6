import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";

const supplierSchema = z.object({ name: z.string(), contact: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() });

export async function listSuppliersHandler(_req: Request, res: Response) {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  res.json(suppliers);
}

export async function createSupplierHandler(req: Request, res: Response) {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const supplier = await prisma.supplier.create({ data: parsed.data });
  res.status(201).json(supplier);
}

export async function updateSupplierHandler(req: Request, res: Response) {
  const parsed = supplierSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(supplier);
}

export async function deleteSupplierHandler(req: Request, res: Response) {
  await prisma.supplier.delete({ where: { id: req.params.id } });
  res.status(204).send();
}