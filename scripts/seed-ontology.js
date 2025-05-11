// scripts/seed-ontology.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Seeding OntologyStore with account:", deployer.address);

  const OntologyStore = await ethers.getContractFactory("OntologyStore");
  const store = await OntologyStore.deploy();
  await store.deployed();
  console.log("OntologyStore @", store.address);

  const triples = [
    // Triple(subject, predicate, object)
    ["TokenomicsOracle", "hasParam", "inflationBP"],
    ["inflationBP", "type", "uint32"],
    ["inflationBP", "min", "0"],
    ["inflationBP", "max", "5000"],
    ["TokenomicsOracle", "hasFunction", "proposeParamsWithProof"],
    ["TokenomicsOracle", "hasFunction", "executeParams"]
  ].map(([s,p,o]) => [
    ethers.utils.id(s),
    ethers.utils.id(p),
    ethers.utils.id(o)
  ]);

  for (const [s,p,o] of triples) {
    const tx = await store.addTriple(s,p,o);
    await tx.wait();
    console.log(`Added triple:`, s, p, o);
  }

  console.log("Ontology seeding complete.");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
