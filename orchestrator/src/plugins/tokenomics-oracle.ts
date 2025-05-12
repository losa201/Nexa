import EventEmitter from "eventemitter3";
import { Contract, providers } from "ethers";
import TokenomicsJSON from "../../TokenomicsOracle.json";

export default {
  init(emitter: EventEmitter) {
    const rpc = process.env.RPC_URL!;
    const provider = new providers.JsonRpcProvider(rpc);
    const oracleAddr = process.env.ORACLE_ADDRESS!;
    const contract = new Contract(oracleAddr, TokenomicsJSON.abi, provider);

    contract.on("ParameterUpdated", (key: string, oldVal: any, newVal: any, ts: any) => {
      const k = Buffer.from(key.slice(2), "hex").toString(); // decode bytes32
      console.log(\`🛰️  [Oracle] \${k}: \${oldVal.toString()} → \${newVal.toString()} @\${new Date(ts.toNumber() * 1000).toISOString()}\`);
      emitter.emit("parameterUpdated", { key: k, oldValue: oldVal.toNumber(), newValue: newVal.toNumber(), timestamp: ts.toNumber() });
    });

    console.log("✅ TokenomicsOracle plugin initialized and listening for updates");
  }
};
