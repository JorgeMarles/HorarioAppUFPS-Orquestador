import type { NextFunction, Request, Response } from "express";
import type ErrorResponse from "./interface/error-response";
import { env } from "./env.js";
import { apiLogger } from "./util/logger.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  
  apiLogger.warn({ 
    url: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  }, 'Route not found');
  
  next(error);
}

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, _next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  apiLogger.error({ 
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  }, 'Request error');
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
