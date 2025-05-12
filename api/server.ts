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

  // ← fixed import!
  useServer({ schema }, wsServer);
}

startApollo().catch(err => {
  console.error('❌ Apollo failed to start', err);
  process.exit(1);
});
