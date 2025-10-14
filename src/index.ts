import type { Application, Request, Response, NextFunction } from "express";
import express from "express";
import { AppError } from "./libs/AppError.js";
import referralsRouter from "./routes/referrals.js";

const app: Application = express();

app.use("/api/referrals", referralsRouter);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || null,
    });
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
