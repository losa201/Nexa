import { keccak_256 } from "js-sha3";
import { Buffer } from "buffer";

/**
 * Build a standard Merkle tree over an array of Buffers.
 * Returns all levels (0 = leaves) up to the single root.
 */
export function buildMerkleTree(leaves: Buffer[]): Buffer[][] {
  if (leaves.length === 0) {
    throw new Error("Cannot build tree with zero leaves");
  }
  const layers: Buffer[][] = [];
  layers.push(leaves);
  while (layers[layers.length - 1].length > 1) {
    const prev = layers[layers.length - 1];
    const next: Buffer[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const left = prev[i];
      const right = i + 1 < prev.length ? prev[i + 1] : left;
      next.push(Buffer.from(keccak_256(Buffer.concat([left, right])), "hex"));
    }
    layers.push(next);
  }
  return layers;
}

/**
 * Given multiple sub-shard roots (as hex strings), build the top-level Merkle-of-Merkle.
 * Returns { root, layers } where root is hex and layers is array of hex layers.
 */
export function buildFractalMerkle(subShardRoots: string[]): {
  root: string;
  layers: string[][];
} {
  const leaves = subShardRoots.map(h => Buffer.from(h.replace(/^0x/, ""), "hex"));
  const tree = buildMerkleTree(leaves);
  const hexLayers = tree.map(layer => layer.map(buf => "0x" + buf.toString("hex")));
  return { root: hexLayers[hexLayers.length-1][0], layers: hexLayers };
}

// Example usage
if (require.main === module) {
  const subs = [
    "0xaaaabbbbccccddddaaaabbbbccccddddaaaabbbbccccddddaaaabbbbccccdddd",
    "0x1111222233334444111122223333444411112222333344441111222233334444",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  ];
  const { root, layers } = buildFractalMerkle(subs);
  console.log("Sub-roots:", subs);
  console.log("Merkle-of-Merkle root:", root);
  console.log("Layers:", layers);
}
