import { gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';

interface Event {
  type: string;
  key?: string;
  oldValue?: number;
  newValue?: number;
  to?: string;
  from?: string;
  amount?: number;
  dstChainId?: number;
  srcChainId?: number;
  timestamp: number;
}

// In-memory event store + pub/sub
const pubsub = new PubSub();
const EVENT_ADDED = 'EVENT_ADDED';
const eventsStore: Event[] = [];

export const typeDefs = gql\`
  type Event {
    type: String!
    key: String
    oldValue: Int
    newValue: Int
    to: String
    from: String
    amount: Int
    dstChainId: Int
    srcChainId: Int
    timestamp: Int!
  }

  type Query {
    recentEvents(limit: Int): [Event!]!
  }

  type Subscription {
    eventAdded: Event!
  }
\`;

export const resolvers = {
  Query: {
    recentEvents: (_: any, { limit }: { limit?: number }) =>
      limit ? eventsStore.slice(-limit) : eventsStore,
  },
  Subscription: {
    eventAdded: {
      subscribe: () => pubsub.asyncIterator([EVENT_ADDED]),
    },
  },
};

export function publishEvent(ev: Event) {
  eventsStore.push(ev);
  pubsub.publish(EVENT_ADDED, { eventAdded: ev });
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
