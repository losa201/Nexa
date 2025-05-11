// api/src/opa-middleware.ts
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce fine‑grained authorization via Open Policy Agent.
 * Assumes OPA is running at process.env.OPA_URL, serving policies under /v1/data.
 */
export async function opaAuth(
  req: Request & { user?: { role?: string } },
  res: Response,
  next: NextFunction
) {
  try {
    // Build the OPA input document
    const input = {
      path: req.path,
      method: req.method,
      // You may populate user role from earlier auth middleware
      user_role: req.user?.role || 'anonymous'
    };

    const opaUrl = `${process.env.OPA_URL}/v1/data/nexa/authz/allow`;
    const { data } = await axios.post(opaUrl, { input });

    if (data.result && data.result.allow === true) {
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden by policy' });
    }
  } catch (err: any) {
    console.error('OPA authorization error:', err.message);
    return res.status(500).json({ error: 'Authorization failure' });
  }
}
