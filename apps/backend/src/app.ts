import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TestTantra API is running"
  });
});

app.use("/api/v1", apiRoutes);

// Global Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Backend Internal Error:", err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An internal server error occurred"
    }
  });
});

export default app;