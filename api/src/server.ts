import * as path from 'path';
import { config as loadEnv } from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import thresholdRouter from './services/threshold';
import { schema } from './graphql';

// 1️⃣ Load .env from repo root
loadEnv({ path: path.resolve(__dirname, '../../.env') });

// 2️⃣ Set up Express + HTTP server
const app = express();
const server = http.createServer(app);

app.use(express.json());
// Mount your existing threshold REST endpoints
app.use('/api', thresholdRouter);

// 3️⃣ Server-Sent Events (SSE) for arbitrary event forwarding
let clients: Response[] = [];
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Expose a POST hook to broadcast to all SSE clients
app.post('/api/events', (req, res) => {
  const event = req.body;
  clients.forEach(c =>
    c.write(`data: ${JSON.stringify(event)}\n\n`)
  );
  res.sendStatus(200);
});

// 4️⃣ GraphQL & WebSocket Subscriptions
async function startApollo() {
  const apollo = new ApolloServer({ schema });
  await apollo.start();
  apollo.applyMiddleware({ app, path: '/graphql' });

  // WebSocket for subscriptions
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql',
  });
  useServer(
    {
      schema,
      execute: (...args) => (schema.execute ? schema.execute(...args) : null),
      subscribe: (...args) => (schema.subscribe ? schema.subscribe(...args) : null),
    },
    wsServer
  );
}

startApollo().catch(err => {
  console.error('❌ Apollo failed to start', err);
  process.exit(1);
});

// 5️⃣ Boot
const PORT = parseInt(process.env.PORT || '4000', 10);
server.listen(PORT, () => {
  console.log(`🚀 HTTP + SSE + GraphQL running at http://localhost:${PORT}`);
  console.log(`📶 Subscriptions ws://localhost:${PORT}/graphql`);
});
