import { Router } from "express";
import authRoutes from "./modules/auth.routes";
import partsRoutes from "./modules/parts.routes";
import ordersRoutes from "./modules/orders.routes";
import suppliersRoutes from "./modules/suppliers.routes";
import reportsRoutes from "./modules/reports.routes";
import auditRoutes from "./modules/audit.routes";
import healthRoute from "./modules/health.routes";
import intakeRoutes from "./modules/intake.routes";
import workflowsRoutes from "./modules/workflows.routes";
import projectsRoutes from "./modules/projects.routes";
import categoriesRoutes from "./modules/categories.routes";
import analyticsRoutes from "./modules/analytics.routes";
import integrationsRoutes from "./modules/integrations.routes";
import eventsRoutes from "./modules/events.routes";

export function registerRoutes(router: Router) {
  router.use("/", healthRoute);
  router.use("/auth", authRoutes);
  router.use("/parts", partsRoutes);
  router.use("/orders", ordersRoutes);
  router.use("/suppliers", suppliersRoutes);
  router.use("/reports", reportsRoutes);
  router.use("/audit", auditRoutes);
  // Procurement
  router.use("/intake", intakeRoutes);
  router.use("/workflows", workflowsRoutes);
  router.use("/projects", projectsRoutes);
  router.use("/categories", categoriesRoutes);
  router.use("/analytics", analyticsRoutes);
  router.use("/integrations", integrationsRoutes);
  router.use("/events", eventsRoutes);
}