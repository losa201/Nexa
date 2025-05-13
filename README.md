Nexa Blockchain

Nexa is a modular, zero-knowledge-compatible blockchain orchestration framework focused on compliance, transparency, and performance.

This monorepo includes:

Smart contract infrastructure (Hardhat + Solidity)

TypeScript orchestrator with plugin architecture

GraphQL + SSE API

Optional frontend dashboard

CLI toolchain

Zero-knowledge circuit support (via Circom/snarkjs)



---

🚀 Features Overview

✅ Core Modules

Hardhat contracts with zk-compatible logic

GraphQL API with Apollo Server and SSE support

WebSocket Subscriptions using graphql-ws@5

RESTful Events + Threshold API for integrations

Plugin-based orchestrator (ai-summarizer, audit-publisher, fee-tuner)

Zero-Knowledge Circuits (Benefit.circom, RangeProof.circom)

TypeScript CLI via nexa-cli


🔐 Anonymous zkToken Support (WIP)

Integration planned using keccak256, MerkleTree.js

zk-SNARK proof generation enabled via circom and snarkjs

Circuit artifacts (.wasm, .zkey, .sym) partially generated


⚙️ Developer Tooling

Modular project layout using npm workspaces

Resilient build with --legacy-peer-deps to resolve hardhat/ethers conflicts

Workspace-aware CLI (nexa health, nexa propose, etc.)

Circuits and proofs testable via CLI


🌐 GraphQL Schema

query {
  feeRate
  threshold
  ...more coming
}


---

🛠️ Setup

1. Clone + Bootstrap

git clone https://github.com/your-org/nexa.git
cd nexa
rm -rf node_modules package-lock.json
git clean -xfd # optional if setup is broken
npm install --legacy-peer-deps

2. Per-package installs

for pkg in api orchestrator dashboard tools/nexa-cli tools/zk-utils; do
  cd $pkg
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps || npm install
  cd - >/dev/null
done

3. Compile + Test

npx hardhat compile
npx hardhat test

4. API Server

cd api
cp .env.example .env
npm run dev

5. Orchestrator

cd orchestrator
npx ts-node src/index.ts

6. CLI

cd tools/nexa-cli
npm link
nexa --help
nexa health

7. Dashboard (optional)

cd dashboard
npm install --legacy-peer-deps
npm start


---

🔍 Zero-Knowledge Circuits

Compile + Setup

npx circom circuits/Benefit.circom --r1cs --wasm --sym
npx snarkjs groth16 setup circuits/Benefit.r1cs pot12_final.ptau zkey_0000.zkey

> NOTE: pot12_final.ptau must be downloaded manually.



Verify Key + Proof Gen

npx snarkjs groth16 export verificationkey zkey_0000.zkey verification_key.json
npx snarkjs groth16 prove zkey_0000.zkey witness.wtns proof.json public.json


---

🧩 Plugin System

Plugins are modular functions added to the orchestrator:

ai-summarizer – Stub for LLM-backed log summarization

audit-publisher – Stub for publishing contract metadata

fee-tuner – Auto-tunes feeRate via on-chain heuristics


All plugins are auto-loaded from:

src/plugins/*.ts


---

📦 Workspaces

/              # monorepo root
├── contracts/            # Solidity
├── orchestrator/        # plugin engine
├── api/                 # GraphQL + REST API
├── dashboard/           # frontend (React)
├── tools/
│   ├── nexa-cli/        # CLI commands
│   └── zk-utils/        # Circom utils
└── circuits/            # Benefit.circom, etc.


---

🧪 Quick GraphQL Smoke Test

curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  --data '{"query":"query { feeRate }"}'


---

📝 Roadmap

[x] WebSocket subscription migration to graphql-ws@5

[x] Restore Express SSE

[x] CLI smoke test (nexa health)

[ ] zkToken mint/burn circuit with Merkle inclusion proof

[ ] Dashboard bug fix (package.json corruption)

[ ] Contract deployments via CLI

[ ] Add plugin registry + disable toggle



---

🔐 Security Notes

This project is experimental.

Use npx audit fix --force to resolve known dependency vulnerabilities.

Contracts are not audited. Do not use in production.



---

📣 Contributors

Thanks to everyone involved. Open to PRs, ideas, and bug reports!


---

📄 License

MIT

