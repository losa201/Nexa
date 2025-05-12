const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OmniChainTokenomics", function () {
  let token, omni;

  before(async function () {
    const MockOFT = await ethers.getContractFactory("MockOFT");
    token = await MockOFT.deploy("Test OFT", "TOFT");
    await token.deployed();

    const Omni = await ethers.getContractFactory("OmniChainTokenomics");
    omni = await Omni.deploy(token.address);
    await omni.deployed();
  });

  it("should mint and send tokens across chain", async function () {
    const to = ethers.Wallet.createRandom().address;
    await expect(omni.mintAcrossChain(to, 100, 101))
      .to.emit(omni, "TokensMinted");
    expect(await token.balanceOf(omni.address)).to.equal(0);
  });

  it("should burn tokens on lzReceive", async function () {
    await token.mint(omni.address, 50);
    await expect(
      omni.lzReceive(101, "0x", ethers.constants.AddressZero, 50, { value: 0 })
    ).to.emit(omni, "TokensBurned");
  });

  it("should respect pause/unpause", async function () {
    await omni.pause();
    await expect(omni.mintAcrossChain(ethers.constants.AddressZero, 1, 101))
      .to.be.revertedWith("Pausable: paused");
    await omni.unpause();
  });
});
