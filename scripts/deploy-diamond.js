// scripts/deploy-diamond.js
const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("@overengineered/hardhat-diamond-abi");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Diamond with account:", deployer.address);

  // Deploy facets
  const TokenomicsFacet = await ethers.getContractFactory("TokenomicsFacet");
  const tokenomicsFacet = await TokenomicsFacet.deploy();
  await tokenomicsFacet.deployed();
  console.log("TokenomicsFacet @", tokenomicsFacet.address);

  const MedicFacet = await ethers.getContractFactory("MedicFacet");
  const medicFacet = await MedicFacet.deploy();
  await medicFacet.deployed();
  console.log("MedicFacet @", medicFacet.address);

  // Prepare cuts
  const cuts = [
    {
      facetAddress: tokenomicsFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(tokenomicsFacet)
    },
    {
      facetAddress: medicFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(medicFacet)
    }
  ];

  // Deploy the Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(deployer.address, cuts);
  await diamond.deployed();
  console.log("Diamond proxy @", diamond.address);

  console.log("\n=== Deployment Complete ===");
  console.log("Diamond:", diamond.address);
  console.log("Facets:");
  console.log(" • TokenomicsFacet:", tokenomicsFacet.address);
  console.log(" • MedicFacet:     ", medicFacet.address);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
