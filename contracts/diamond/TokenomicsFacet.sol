// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../TokenomicsOracle.sol";
import { IDiamondCut } from "./IDiamondCut.sol";

/// @title TokenomicsFacet
/// @notice Exposes TokenomicsOracle logic as a Diamond facet
contract TokenomicsFacet {
    /// @notice Propose parameters via zk‑proof (calls TokenomicsOracle)
    function proposeParamsWithProof(
        address oracle,
        uint256 shardId,
        uint256 epoch,
        TokenomicsOracle.EconParams calldata p,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[1] calldata publicInput
    ) external {
        // delegate call into the Diamond’s TokenomicsOracle logic
        (bool success, ) = oracle.delegatecall(
            abi.encodeWithSignature(
                "proposeParamsWithProof(uint256,uint256,(uint32,uint16,uint32,uint32,uint32),uint256[2],uint256[2][2],uint256[2],uint256[1])",
                shardId,
                epoch,
                p,
                a,
                b,
                c,
                publicInput
            )
        );
        require(success, "proposeParams failed");
    }

    /// @notice Execute parameters after timelock (calls TokenomicsOracle)
    function executeParams(
        address oracle,
        uint256 shardId,
        uint256 epoch
    ) external {
        (bool success, ) = oracle.delegatecall(
            abi.encodeWithSignature(
                "executeParams(uint256,uint256)",
                shardId,
                epoch
            )
        );
        require(success, "executeParams failed");
    }
}
