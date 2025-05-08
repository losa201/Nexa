// RangeProof.circom
// A zk‑SNARK circuit to prove that a private value lies within [0, 2^32)
// using a Num2Bits decomposition and Pedersen commitments for confidentiality.

pragma circom 2.0.0;

include "circomlib/pedersen.circom";
include "circomlib/bitify.circom";

template RangeProof() {
    // Private inputs
    signal input value;      // the secret integer to prove range for
    signal input blinding;   // random blinding factor for the Pedersen commitment

    // Public inputs
    signal input commX;      // x‑coordinate of Pedersen commitment
    signal input commY;      // y‑coordinate of Pedersen commitment

    // 1) Range check: decompose value into 32 bits
    component bits = Num2Bits(32);
    bits.in <== value;

    // 2) Pedersen commitment: C = value · G + blinding · H
    component ped = Pedersen(2);
    ped.in[0] <== value;
    ped.in[1] <== blinding;

    // 3) Ensure the public commitment matches the computed one
    commX === ped.out[0];
    commY === ped.out[1];
}

component main = RangeProof();
