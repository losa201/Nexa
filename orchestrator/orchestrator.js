require('dotenv').config();
const { ethers } = require('ethers');
const OracleABI = require('../contracts/TokenomicsOracle.json').abi;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer   = new ethers.Wallet(process.env.AGENT_KEY, provider);
  const oracle   = new ethers.Contract(process.env.ORACLE_ADDRESS, OracleABI, signer);

  const SHARDS        = process.env.SHARD_IDS.split(',').map(id => Number(id));
  const EPOCH_INTERVAL = Number(process.env.EPOCH_INTERVAL);
  const POLL_INTERVAL  = Number(process.env.POLL_INTERVAL);

  let lastEpoch = Math.floor((await provider.getBlockNumber()) / EPOCH_INTERVAL);

  console.log(`Starting orchestrator at epoch ${lastEpoch}`);

  setInterval(async () => {
    const blockNum = await provider.getBlockNumber();
    const epoch    = Math.floor(blockNum / EPOCH_INTERVAL);

    // 1. New‑epoch proposals
    if (epoch > lastEpoch) {
      for (const shardId of SHARDS) {
        try {
          console.log(`Proposing shard ${shardId} @ epoch ${epoch}`);
          const tx = await oracle.proposeEnsemble(shardId, epoch);
          await tx.wait();
          console.log(`→ Proposal tx confirmed (${tx.hash})`);
        } catch (e) {
          console.warn(`→ propose failed: ${e.message}`);
        }
      }
      lastEpoch = epoch;
    }

    // 2. Execute ready proposals
    const count = (await oracle.proposalCount()).toNumber();
    for (let id = 0; id < count; id++) {
      const prop = await oracle.proposals(id);
      if (!prop.executed && blockNum >= prop.timestamp.toNumber() + EPOCH_INTERVAL * 2) {
        try {
          console.log(`Executing proposal ${id}`);
          const tx = await oracle.executeProposal(id);
          await tx.wait();
          console.log(`→ Execution tx confirmed (${tx.hash})`);
        } catch (e) {
          console.warn(`→ execute failed: ${e.message}`);
        }
      }
    }

    // 3. Place for rollback checks...
  }, POLL_INTERVAL);
}

main().catch(err => {
  console.error("Orchestrator failed:", err);
  process.exit(1);
});
