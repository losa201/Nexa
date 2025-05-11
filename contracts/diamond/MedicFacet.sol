// contracts/diamond/MedicFacet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../TokenomicsOracle.sol";

/// @title MedicFacet
/// @notice Provides on‑chain self‑healing for stale or stuck proposals in a Diamond setup
contract MedicFacet {
    /// @notice Heal stale proposals by rolling them back
    /// @param oracle Address of the TokenomicsOracle facet (in the Diamond)
    /// @param maxEpochs Age threshold in epochs after which proposals are considered stale
    function healStaleProposals(address oracle, uint256 maxEpochs) external {
        TokenomicsOracle oracleContract = TokenomicsOracle(oracle);
        uint256 count = oracleContract.getProposalCount(); // assume such view exists
        for (uint256 id = 0; id < count; id++) {
            (, uint256 epoch, , , bool executed) = oracleContract.getProposal(id);
            if (!executed && block.number > epoch + maxEpochs) {
                // rollback stale proposal
                (bool success, ) = oracle.delegatecall(
                    abi.encodeWithSignature(
                        "rollback(uint256)", // assume rollback exists
                        id
                    )
                );
                require(success, "Rollback failed");
            }
        }
    }
}
