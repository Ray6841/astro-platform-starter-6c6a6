import { createApp } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  const app = await createApp();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});