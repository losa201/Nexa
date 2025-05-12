// orchestrator/src/plugins/quantile-anomaly-detector.ts
import EventEmitter from "eventemitter3";
import { TDigest } from "tdigest";
import dotenv from "dotenv";

dotenv.config();

const PERCENTILE = parseFloat(process.env.ANOMALY_PERCENTILE || "0.99");
const digest = new TDigest();

export default {
  init(emitter: EventEmitter) {
    emitter.on("minted", ({ amount, to, dstChainId, timestamp }) => {
      digest.push(amount);
      digest.compress();
      const threshold = digest.percentile(PERCENTILE * 100);

      if (amount > threshold) {
        console.warn(
          `🚨 [QuantileAnomaly] Mint ${amount} at ${new Date(
            timestamp * 1000
          ).toISOString()} to ${to} exceeds ${PERCENTILE * 100}th percentile (${threshold.toFixed(
            2
          )})`
        );
        // TODO: integrate external alerting (Slack/email)
      }
    });

    console.log(`✅ Quantile anomaly detector initialized (percentile=${PERCENTILE})`);
  }
};
