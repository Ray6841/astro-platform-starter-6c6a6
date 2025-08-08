import { Router } from "express";

const router = Router();

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  const interval = setInterval(() => {
    res.write(`event: heartbeat\n`);
    res.write(`data: {"ts":"${new Date().toISOString()}"}\n\n`);
  }, 15000);
  req.on("close", () => clearInterval(interval));
});

export default router;