import { Request, Response } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import Papa from "papaparse";

const partSchema = z.object({
  partNumber: z.string(),
  awtPartNumber: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  category: z.string().optional(),
  binNumber: z.string().optional(),
  location: z.string().optional(),
  unit: z.string().optional(),
  quantityInStock: z.number().int().nonnegative().optional(),
  toOrderExcess: z.string().optional(),
  unitCost: z.number().nonnegative().optional(),
  inventoryValue: z.number().nonnegative().optional(),
  reorderLevel: z.number().int().nonnegative().optional(),
  supplierId: z.string().optional(),
  leadTimeDays: z.number().int().nonnegative().optional(),
  barcode: z.string(),
});

export async function listPartsHandler(req: Request, res: Response) {
  const { q, page = "1", pageSize = "20", category } = req.query as Record<string, string>;
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const take = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100);
  const where: any = {};
  if (q) {
    where.OR = [
      { partNumber: { contains: q, mode: "insensitive" } },
      { awtPartNumber: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { barcode: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.part.findMany({ where, skip: (pageNum - 1) * take, take, orderBy: { createdAt: "desc" }, include: { supplier: true } }),
    prisma.part.count({ where }),
  ]);
  res.json({ items, total, page: pageNum, pageSize: take });
}

export async function getPartHandler(req: Request, res: Response) {
  const part = await prisma.part.findUnique({ where: { id: req.params.id }, include: { supplier: true } });
  if (!part) return res.status(404).json({ error: { message: "Not found" } });
  res.json(part);
}

export async function searchByBarcodeHandler(req: Request, res: Response) {
  const part = await prisma.part.findUnique({ where: { barcode: req.params.code } });
  if (!part) return res.status(404).json({ error: { message: "Not found" } });
  res.json(part);
}

export async function createPartHandler(req: Request, res: Response) {
  const parsed = partSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const data = parsed.data;
  const created = await prisma.part.create({
    data: {
      ...data,
      unitCost: data.unitCost ?? 0,
      inventoryValue: data.inventoryValue ?? (data.unitCost ?? 0) * (data.quantityInStock ?? 0),
    },
  });
  res.status(201).json(created);
}

export async function updatePartHandler(req: Request, res: Response) {
  const parsed = partSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const data = parsed.data;
  const existing = await prisma.part.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: { message: "Not found" } });
  const quantity = data.quantityInStock ?? existing.quantityInStock;
  const unitCost = data.unitCost ?? Number(existing.unitCost);
  const updated = await prisma.part.update({
    where: { id: req.params.id },
    data: {
      ...data,
      inventoryValue: data.inventoryValue ?? unitCost * quantity,
    },
  });
  if (data.quantityInStock !== undefined && data.quantityInStock !== existing.quantityInStock) {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "UPDATE_PART_QUANTITY",
        entity: "Part",
        entityId: existing.id,
        details: { from: existing.quantityInStock, to: data.quantityInStock },
      },
    });
  }
  res.json(updated);
}

export async function deletePartHandler(req: Request, res: Response) {
  await prisma.part.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function uploadCsvHandler(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: { message: "File required" } });
  const csv = req.file.buffer.toString("utf8");
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true });
  const rows = parsed.data.filter(Boolean);

  const updates = rows.map((row) => {
    const quantity = Number(row["Quantity in Stock"]) || 0;
    const unitCost = Number(row["Unit Cost"]) || 0;
    const barcode = row["Barcode"] || row["barcode"] || row["Part Number"] || "";
    return prisma.part.upsert({
      where: { barcode },
      update: {
        partNumber: row["Part Number"] || barcode,
        awtPartNumber: row["AWT Part Number"] || null,
        description: row["Description"] || null,
        size: row["Size"] || null,
        material: row["Material"] || null,
        category: row["Category"] || null,
        binNumber: row["Bin Number"] || null,
        location: row["Location"] || null,
        unit: row["Unit"] || null,
        quantityInStock: quantity,
        unitCost,
        inventoryValue: unitCost * quantity,
        reorderLevel: Number(row["Reorder Level"]) || 0,
        leadTimeDays: Number(row["Lead Time"]) || 0,
      },
      create: {
        barcode,
        partNumber: row["Part Number"] || barcode,
        awtPartNumber: row["AWT Part Number"] || null,
        description: row["Description"] || null,
        size: row["Size"] || null,
        material: row["Material"] || null,
        category: row["Category"] || null,
        binNumber: row["Bin Number"] || null,
        location: row["Location"] || null,
        unit: row["Unit"] || null,
        quantityInStock: quantity,
        unitCost,
        inventoryValue: unitCost * quantity,
        reorderLevel: Number(row["Reorder Level"]) || 0,
        leadTimeDays: Number(row["Lead Time"]) || 0,
      },
    });
  });

  await prisma.$transaction(updates);
  res.json({ updated: updates.length });
}