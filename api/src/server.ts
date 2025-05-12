import * as path from 'path';
import { config as loadEnv } from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { useServer } from 'graphql-ws';
import { execute, subscribe } from 'graphql';
import { WebSocketServer } from 'ws';

import thresholdRouter from './services/threshold';
import { schema } from './graphql';

// 1️⃣ Load .env from repo root
loadEnv({ path: path.resolve(__dirname, '../../.env') });

// 2️⃣ Set up Express + HTTP server
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Mount REST endpoints
app.use('/api', thresholdRouter);

// SSE endpoint(s)
let sseClients: Response[] = [];
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

app.post('/api/events', (req, res) => {
  const ev = req.body;
  sseClients.forEach(c => c.write(`data: ${JSON.stringify(ev)}\n\n`));
  res.sendStatus(200);
});

// 3️⃣ GraphQL + Subscriptions
async function startApollo() {
  const apollo = new ApolloServer({ schema });
  await apollo.start();
  apollo.applyMiddleware({ app, path: '/graphql' });

  // ——— WebSocket server for GraphQL Subscriptions ———
  const wsServer = new WebSocketServer({ server, path: '/graphql' });
  useServer(
    {
      schema,
      execute,
      subscribe,
      onConnect(ctx) {
        console.log('📡 WS client connected');
      },
      onDisconnect(ctx, code, reason) {
        console.log('📴 WS client disconnected');
      },
    },
    wsServer
  );
}

startApollo()
  .then(() => {
    server.listen(4000, () =>
      console.log(`🚀 HTTP+WS ready at http://localhost:4000/graphql`)
    );
  })
  .catch(err => {
    console.error('Failed to start ApolloServer', err);
    process.exit(1);
  });
