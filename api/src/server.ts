import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './graphql';

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(express.json());
  app.use('/api', require('./services/threshold').router);

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

app.post('/api/events', (req, res) => {
  const event = req.body;
  clients.forEach(c => c.write(`data: ${JSON.stringify(event)}\n\n`));
  res.sendStatus(200);
});

async function start() {
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  apollo.applyMiddleware({ app, path: '/graphql' });

  const port = process.env.PORT || 4000;
  server.listen(port, () => {
    console.log(`API listening on http://localhost:${port}${apollo.graphqlPath}`);
    console.log(`SSE endpoint at http://localhost:${port}/events`);
  });
}

start();
