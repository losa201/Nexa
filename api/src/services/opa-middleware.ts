import { Request, Response, NextFunction } from 'express';

// Stub OPA: always allow
export function opaMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next();
}
