// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./BenefitVerifier.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @title TokenomicsOracle
/// @notice Manages on‑chain governance of tokenomics parameters via zk‑SNARK proofs
contract TokenomicsOracle is
    BenefitVerifier,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    /// @dev Parameters for each shard
    struct EconParams {
        uint32 inflationBP;
        uint16 baseFeeBP;
        uint32 slashingBP;
        uint32 rewardSlope;
        uint32 rewardOffset;
    }

    /// @notice Current staged parameters per shard
    mapping(uint256 => EconParams) public currentParams;

    /// @notice Governor (e.g. timelock or DAO)
    address public governor;
    /// @notice Off‑chain RL agent allowed to propose
    address public rlAgent;
    /// @notice Minimum delay between staging and execution
    uint256 public timelock;

    event ParamsProposed(
        uint256 indexed shardId,
        uint256 indexed epoch,
        EconParams params
    );
    event ParamsExecuted(
        uint256 indexed shardId,
        uint256 indexed epoch,
        EconParams params
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize instead of constructor for UUPS
    function initialize(
        EconParams memory initParams,
        address _governor,
        address _rlAgent,
        uint256 _timelock
    ) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Pausable_init();

        governor = _governor;
        rlAgent = _rlAgent;
        timelock = _timelock;

        // default shard 0
        currentParams[0] = initParams;
    }

    /// @notice Required by UUPS for upgrade authorization
    function _authorizeUpgrade(address) internal override onlyOwner {}

    /// @notice Propose new parameters with a zk-proof
    /// @param shardId Target shard
    /// @param epoch   Epoch number for sequencing
    /// @param p       New parameters
    /// @param a,b,c   zk-SNARK proof
    /// @param publicInput Public input array (e.g. hash of p)
    function proposeParamsWithProof(
        uint256 shardId,
        uint256 epoch,
        EconParams calldata p,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[1] calldata publicInput
    ) external whenNotPaused {
        require(msg.sender == rlAgent, "Only RL agent may propose");

        EconParams memory old = currentParams[shardId];

        // verify monotonicity & proof
        _verifyBenefit(a, b, c, publicInput, old.inflationBP, p.inflationBP);

        // stage the new params under (shardId, epoch)
        // (in a production version, store in a mapping for delayed execution)
        currentParams[shardId] = p;

        emit ParamsProposed(shardId, epoch, p);
    }

    /// @notice Execute staged parameters after timelock
    function executeParams(uint256 shardId, uint256 epoch) external whenNotPaused {
        require(msg.sender == governor, "Only governor may execute");
        // For simplicity, assume timelock passed. In production, check block.timestamp.

        EconParams memory p = currentParams[shardId];
        emit ParamsExecuted(shardId, epoch, p);
        // apply effects: e.g., update reward math, emit further events...
    }

    /// @notice Emergency pause
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Resume operations
    function unpause() external onlyOwner {
        _unpause();
    }
}
