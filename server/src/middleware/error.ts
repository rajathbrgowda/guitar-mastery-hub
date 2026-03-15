import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err.name === 'AppError') {
    const appErr = err as AppError;
    res.status(appErr.statusCode).json({ error: appErr.message });
    return;
  }

  // Zod validation errors passed through manually will have a message
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ error: 'Internal server error' });
}
