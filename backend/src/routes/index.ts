import { Router } from "express";
import authRoutes from "./modules/auth.routes";
import partsRoutes from "./modules/parts.routes";
import ordersRoutes from "./modules/orders.routes";
import suppliersRoutes from "./modules/suppliers.routes";
import reportsRoutes from "./modules/reports.routes";
import auditRoutes from "./modules/audit.routes";
import healthRoute from "./modules/health.routes";

export function registerRoutes(router: Router) {
  router.use("/", healthRoute);
  router.use("/auth", authRoutes);
  router.use("/parts", partsRoutes);
  router.use("/orders", ordersRoutes);
  router.use("/suppliers", suppliersRoutes);
  router.use("/reports", reportsRoutes);
  router.use("/audit", auditRoutes);
}