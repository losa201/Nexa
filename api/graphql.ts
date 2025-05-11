// api/src/graphql.ts
import { gql } from 'apollo-server-express';
import { ethers } from 'ethers';

// GraphQL schema
export const typeDefs = gql`
  type EconParams {
    inflationBP: Int!
    baseFeeBP: Int!
    slashingBP: Int!
    rewardSlope: Int!
    rewardOffset: Int!
  }

  type Proposal {
    shardId: Int!
    epoch: Int!
    params: EconParams!
    executed: Boolean!
  }

  type Query {
    # Fetch current parameters for a given shard
    shardParams(shardId: Int!): EconParams!

    # List recent proposals (stubbed)
    proposals(limit: Int = 10): [Proposal!]!
  }

  type Mutation {
    # Propose new params (delegates to REST endpoint)
    propose(shardId: Int!, epoch: Int!, publicHash: String!): Boolean!
  }

  type Subscription {
    proposalCreated: Proposal!
    proposalExecuted: Proposal!
  }
`;

// In-memory pubsub for subscriptions
import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

// Placeholder: in-memory store of proposals
const proposalStore: { shardId: number; epoch: number; params: any; executed: boolean }[] = [];

export const resolvers = {
  Query: {
    shardParams: async (_: any, { shardId }: { shardId: number }, { paramsLoader }: any) => {
      return await paramsLoader.load(shardId);
    },
    proposals: () => {
      return proposalStore.slice(-10).reverse();
    },
  },
  Mutation: {
    propose: async (_: any, { shardId, epoch, publicHash }: any, { req }: any) => {
      // Call internal REST API to propose
      const res = await fetch(
        `${process.env.API_BASE}/tokenomics/propose/${shardId}/${epoch}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicHash }),
        }
      );
      if (res.ok) {
        // For subscription demo, push into store
        proposalStore.push({
          shardId,
          epoch,
          params: { inflationBP: 0, baseFeeBP: 0, slashingBP: 0, rewardSlope: 0, rewardOffset: 0 },
          executed: false,
        });
        pubsub.publish('proposalCreated', {
          proposalCreated: proposalStore[proposalStore.length - 1],
        });
        return true;
      }
      return false;
    },
  },
  Subscription: {
    proposalCreated: {
      subscribe: () => pubsub.asyncIterator(['proposalCreated']),
    },
    proposalExecuted: {
      subscribe: () => pubsub.asyncIterator(['proposalExecuted']),
    },
  },
};
