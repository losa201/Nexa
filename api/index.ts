// api/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../openapi.json';
import { checkJwt } from './auth';
import { checkDIDJwt } from './auth-did';
import { opaAuth } from './opa-middleware';
import { createParamsLoader } from './dataloaders';
import { typeDefs, resolvers } from './graphql';
import { ApolloServer } from 'apollo-server-express';
import { registerWebhook, emitEvent } from './webhooks';
import './cleanup';
import { smsAlert, emailAlert } from './alerts';
import producer from './kafka';
import { initPrometheus } from './prometheus';

dotenv.config();

const app = express();
initPrometheus(app);

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Webhooks
app.post('/webhooks', (req: Request, res: Response) => {
  const { url, event } = req.body;
  registerWebhook(url, event);
  res.json({ success: true });
});

// Tokenomics endpoints
app.post(
  '/tokenomics/propose/:shardId/:epoch',
  checkJwt,
  opaAuth,
  async (req: Request, res: Response) => {
    const { shardId, epoch } = req.params;
    // ... call on-chain propose ...
    await smsAlert(process.env.ALERT_PHONE!, `Proposal ${shardId}/${epoch} submitted`);
    await producer.send({
      topic: 'tokenomics.proposed',
      messages: [{ value: JSON.stringify({ shardId, epoch }) }]
    });
    await emitEvent('tokenomics.proposed', { shardId, epoch });
    res.json({ success: true, shardId, epoch });
  }
);

app.post(
  '/tokenomics/execute/:shardId/:epoch',
  checkDIDJwt,
  opaAuth,
  async (req: Request, res: Response) => {
    const { shardId, epoch } = req.params;
    // ... call on-chain execute ...
    await emailAlert(process.env.ALERT_EMAIL!, `Executed ${shardId}/${epoch}`, 'Execution successful');
    producer.send({
      topic: 'tokenomics.executed',
      messages: [{ value: JSON.stringify({ shardId, epoch }) }]
    });
    await emitEvent('tokenomics.executed', { shardId, epoch });
    res.json({ success: true, shardId, epoch });
  }
);

// GraphQL setup
(async () => {
  const paramsLoader = createParamsLoader();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ paramsLoader })
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
})();

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
