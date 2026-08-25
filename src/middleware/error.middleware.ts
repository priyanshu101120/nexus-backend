import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

interface AppError {
  status?: number;
  statusCode?: number;
  message?: string;
}

export function errorMiddleware(
  err: AppError | ZodError | Prisma.PrismaClientKnownRequestError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors that slipped through (e.g. thrown manually, not via validate middleware)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.flatten().fieldErrors,
    });
  }

  // Prisma known errors — most common ones translated to sane HTTP codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = (err.meta?.target as string[])?.join(", ") || "field";
      return res.status(409).json({ message: `${field} already in use` });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found" });
    }
    console.error("Unhandled Prisma error:", err.code, err.message);
    return res.status(500).json({ message: "Database error" });
  }

  // Our own ApiError (or any error using either `statusCode` or `status`)
  const appErr = err as AppError;
  const status = appErr.statusCode || appErr.status || 500;
  const message = appErr.message || "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}