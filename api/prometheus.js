// api/src/prometheus.js
import client from 'prom-client';
import { Application, Request, Response, NextFunction } from 'express';

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;

// Create a Registry and register default metrics
const register = new Registry();
collectDefaultMetrics({ register });

/**
 * Initializes Prometheus middleware on the given Express app.
 * - Exposes metrics at /metrics
 * - Measures request durations and counts.
 */
export function initPrometheus(app: Application): void {
  // Histogram for request durations
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    registers: [register]
  });

  // Middleware to measure each request
  app.use((req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDuration.startTimer({
      method: req.method,
      route: req.route?.path || req.path
    });
    res.on('finish', () => {
      end({ status_code: res.statusCode });
    });
    next();
  });

  // Expose /metrics endpoint
  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}
