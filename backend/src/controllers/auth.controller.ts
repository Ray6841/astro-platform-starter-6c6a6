import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]).default("STAFF"),
});

export async function registerHandler(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const { email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: { message: "Email already in use" } });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, role } });
  return res.status(201).json({ id: user.id, email: user.email, role: user.role });
}

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: "Invalid input", details: parsed.error.flatten() } });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: { message: "Invalid credentials" } });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { message: "Invalid credentials" } });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function profileHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: { message: "Unauthorized" } });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: { message: "User not found" } });
  return res.json({ id: user.id, email: user.email, role: user.role });
}