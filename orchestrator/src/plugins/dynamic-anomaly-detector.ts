// orchestrator/src/plugins/dynamic-anomaly-detector.ts
import EventEmitter from "eventemitter3";

const FACTOR = Number(process.env.ANOMALY_FACTOR) || 3; // k
let count = 0;
let mean = 0;
let M2 = 0;  // sum of squares of differences from the current mean

function updateStats(x: number) {
  count += 1;
  const delta = x - mean;
  mean += delta / count;
  const delta2 = x - mean;
  M2 += delta * delta2;
}

function currentStd() {
  return count < 2 ? 0 : Math.sqrt(M2 / (count - 1));
}

export default {
  init(emitter: EventEmitter) {
    emitter.on("minted", ({ to, amount, dstChainId, timestamp }) => {
      updateStats(amount);
      const std = currentStd();
      const threshold = mean + FACTOR * std;
      if (amount > threshold) {
        console.warn(
          `🚨 [DynamicAnomaly] amount=${amount} > mean(${mean.toFixed(2)})+${FACTOR}σ(${std.toFixed(2)}) → threshold=${threshold.toFixed(2)}`
        );
        // TODO: hook in external alerting (email/Slack)
      }
    });
    console.log(`✅ Dynamic anomaly detector initialized (factor=${FACTOR})`);
  }
};
