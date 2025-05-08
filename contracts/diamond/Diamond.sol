// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IDiamondCut.sol";
import { LibDiamond } from "./LibDiamond.sol";

/// @title Diamond
/// @notice EIP‑2535 Diamond proxy for modular, upgradeable facets
contract Diamond {
    /// @param _contractOwner Address to set as owner
    /// @param _diamondCut FacetCut array to deploy initial facets
    constructor(address _contractOwner, IDiamondCut.FacetCut[] memory _diamondCut) {
        // Initialize the Diamond storage & add facets
        LibDiamond.diamondCut(_diamondCut, address(0), "");
        LibDiamond.setContractOwner(_contractOwner);
    }

    /// @notice Delegate fallback to appropriate facet
    fallback() external payable {
        LibDiamond.delegateCallToFacet(msg.sig, msg.data);
    }

    receive() external payable {}
}
