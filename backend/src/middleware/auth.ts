import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserJwt = { id: string; role: "ADMIN" | "MANAGER" | "STAFF" };

declare global {
  namespace Express {
    interface Request {
      user?: UserJwt;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserJwt;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: { message: "Invalid token" } });
  }
}

export function requireRole(...roles: UserJwt["role"][ ] ) {
  const allowed = new Set(roles);
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: { message: "Unauthorized" } });
    if (!allowed.has(req.user.role)) return res.status(403).json({ error: { message: "Forbidden" } });
    next();
  };
}