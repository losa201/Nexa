// api/src/dataloaders.ts
import DataLoader from 'dataloader';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL!;
const TOKENOMICS_ADDRESS = process.env.TOKENOMICS_ADDRESS!;

/**
 * Creates a DataLoader to batch and cache currentParams calls.
 */
export function createParamsLoader() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const abi = [
    // Only the fragment we need
    "function currentParams(uint256) view returns (uint32,uint16,uint32,uint32,uint32)"
  ];
  const contract = new ethers.Contract(TOKENOMICS_ADDRESS, abi, provider);

  return new DataLoader<number, {
    inflationBP: number;
    baseFeeBP: number;
    slashingBP: number;
    rewardSlope: number;
    rewardOffset: number;
  }>(async (shardIds: readonly number[]) => {
    // Batch RPC calls in parallel (or use multicall for optimization)
    const promises = shardIds.map(id => contract.currentParams(id));
    const results = await Promise.all(promises);

    return results.map((res: any) => ({
      inflationBP: res[0].toNumber(),
      baseFeeBP: res[1].toNumber(),
      slashingBP: res[2].toNumber(),
      rewardSlope: res[3].toNumber(),
      rewardOffset: res[4].toNumber(),
    }));
  });
}
