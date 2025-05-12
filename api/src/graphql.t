import { gql, PubSub } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';

const pubsub = new PubSub();
export const EVENT_ADDED = 'EVENT_ADDED';

export const typeDefs = gql`
  type ThresholdEvent {
    type: String!
    key: String!
    oldValue: Int
    newValue: Int
    timestamp: Int!
  }

  type Query {
    recentThresholdEvents(limit: Int = 10): [ThresholdEvent!]!
  }

  type Subscription {
    thresholdEvents: ThresholdEvent!
  }

  type Mutation {
    addThresholdEvent(
      type: String!
      key: String!
      oldValue: Int
      newValue: Int
    ): Boolean!
  }
`;

let inMemoryEvents: Array<{
  type: string;
  key: string;
  oldValue?: number;
  newValue?: number;
  timestamp: number;
}> = [];

export const resolvers = {
  Query: {
    recentThresholdEvents: () =>
      inMemoryEvents.slice(-10).reverse(),
  },
  Mutation: {
    addThresholdEvent: (
      _: any,
      { type, key, oldValue, newValue }: any
    ) => {
      const ev = { type, key, oldValue, newValue, timestamp: Math.floor(Date.now() / 1000) };
      inMemoryEvents.push(ev);
      pubsub.publish(EVENT_ADDED, { thresholdEvents: ev });
      return true;
    },
  },
  Subscription: {
    thresholdEvents: {
      subscribe: () => pubsub.asyncIterator([EVENT_ADDED]),
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
