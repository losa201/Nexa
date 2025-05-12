// orchestrator/src/plugins/omni-chain-plugin.ts
import EventEmitter from "eventemitter3";
import { Contract, providers } from "ethers";
import OmniChainJSON from "../../contracts/OmniChainTokenomics.json";

export default {
  init(emitter: EventEmitter) {
    const rpc = process.env.RPC_URL!;
    const provider = new providers.JsonRpcProvider(rpc);
    const omniAddr = process.env.OMNI_ADDRESS!;
    const contract = new Contract(omniAddr, OmniChainJSON.abi, provider);

    contract.on("TokensMinted", (to: string, amount: any, dstChainId: number, ts: any) => {
      console.log(`🌐 [OmniChain] Minted ${amount.toString()} to ${to} on chain ${dstChainId}`);
      emitter.emit("minted", { to, amount: amount.toNumber(), dstChainId, timestamp: ts.toNumber() });
    });
    contract.on("TokensBurned", (from: string, amount: any, srcChainId: number, ts: any) => {
      console.log(`🔥 [OmniChain] Burned ${amount.toString()} from ${from} on chain ${srcChainId}`);
      emitter.emit("burned", { from, amount: amount.toNumber(), srcChainId, timestamp: ts.toNumber() });
    });

    console.log("✅ OmniChainTokenomics plugin initialized");
  }
};
