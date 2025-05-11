// Benefit.circom
// A zk‑SNARK circuit to prove that new inflationBP ≥ old inflationBP
// and that the parameters hash to the public input, without revealing the new values.

pragma circom 2.0.0;

include "circomlib/poseidon.circom";

// Number of bits to represent inflationBP
const BITS = 32;

template BenefitProof() {
    // Private inputs
    signal input oldInflation;      // original inflationBP
    signal input newInflation;      // proposed inflationBP
    signal input baseFee;           // proposed baseFeeBP
    signal input slashingBP;        // proposed slashingBP
    signal input rewardSlope;       // proposed rewardSlope
    signal input rewardOffset;      // proposed rewardOffset
    signal input nonce;             // random nonce for hiding

    // Public input
    signal input publicHash;        // Poseidon hash of all params

    // Enforce monotonicity: newInflation ≥ oldInflation
    component diff = LessEq(BITS);
    diff.in[0] <== oldInflation;
    diff.in[1] <== newInflation;
    diff.out === 1;

    // Hash the parameters to the publicHash
    component hasher = Poseidon(7);
    hasher.inputs[0] <== oldInflation;
    hasher.inputs[1] <== newInflation;
    hasher.inputs[2] <== baseFee;
    hasher.inputs[3] <== slashingBP;
    hasher.inputs[4] <== rewardSlope;
    hasher.inputs[5] <== rewardOffset;
    hasher.inputs[6] <== nonce;

    hasher.out === publicHash;
}

component main = BenefitProof();
