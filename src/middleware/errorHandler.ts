import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

// Error handling middleware
export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  
  // Default error response
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};