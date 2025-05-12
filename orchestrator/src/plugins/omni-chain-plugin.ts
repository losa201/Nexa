// orchestrator/src/plugins/omni-chain-plugin.ts
import EventEmitter from "eventemitter3";
import { Contract, providers } from "ethers";
import fetch from "node-fetch";
import OmniJSON from "../../contracts/OmniChainTokenomics.json";

export default {
  init(emitter: EventEmitter) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL!);
    const contract = new Contract(process.env.OMNI_ADDRESS!, OmniJSON.abi, provider);
    const apiUrl = process.env.API_EVENTS_URL!;

    contract.on("TokensMinted", async (to, amount, dstChainId, ts) => {
      const event = { type:'minted', to, amount: amount.toNumber(), dstChainId, timestamp: ts.toNumber() };
      console.log(`🌐 [OmniChain] Minted ${amount} → ${to} on chain ${dstChainId}`);
      emitter.emit("minted", event);
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event)
        });
      } catch (e) {
        console.error("Failed to forward minted event", e);
      }
    });

    contract.on("TokensBurned", async (from, amount, srcChainId, ts) => {
      const event = { type:'burned', from, amount: amount.toNumber(), srcChainId, timestamp: ts.toNumber() };
      console.log(`🔥 [OmniChain] Burned ${amount} ← ${from} on chain ${srcChainId}`);
      emitter.emit("burned", event);
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event)
        });
      } catch (e) {
        console.error("Failed to forward burned event", e);
      }
    });

    console.log("✅ OmniChain plugin initialized (forwarding events)");
  }
};
