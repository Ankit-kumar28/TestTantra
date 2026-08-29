import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    app.listen(env.PORT, () => {
      console.log(
        `TestTantra API running on http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();