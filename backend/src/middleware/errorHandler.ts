import { NextFunction, Request, Response } from "express";

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof error.status === "number" ? error.status : 500;
  const message = error.message || "Internal Server Error";
  const details = error.details || undefined;

  if (status >= 500) {
    console.error("Unhandled error:", error);
  }

  res.status(status).json({ error: { message, details } });
}