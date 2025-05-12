// orchestrator/src/plugins/tokenomics-oracle.ts
import EventEmitter from "eventemitter3";
import { Contract, providers } from "ethers";
import fetch from "node-fetch";
import TokenomicsJSON from "../../contracts/TokenomicsOracle.json";

export default {
  init(emitter: EventEmitter) {
    const provider = new providers.JsonRpcProvider(process.env.RPC_URL!);
    const contract = new Contract(process.env.ORACLE_ADDRESS!, TokenomicsJSON.abi, provider);
    const apiUrl = process.env.API_EVENTS_URL!;

    contract.on("ParameterUpdated", async (key, oldVal, newVal, ts) => {
      const k = Buffer.from((key as string).slice(2), "hex").toString();
      const event = { type: 'parameterUpdated', key: k, oldValue: oldVal.toNumber(), newValue: newVal.toNumber(), timestamp: ts.toNumber() };
      console.log(`🛰️ [Oracle] ${k}: ${oldVal} → ${newVal}`);
      emitter.emit("parameterUpdated", event);
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event)
        });
      } catch (e) {
        console.error("Failed to forward oracle event", e);
      }
    });

    console.log("✅ TokenomicsOracle plugin initialized (forwarding events)");
  }
};
