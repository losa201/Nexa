// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title IDiamondCut
/// @notice Defines the structure and function for Diamond upgrades (EIP‑2535)
interface IDiamondCut {
    enum FacetCutAction { Add, Replace, Remove }

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /// @notice Add/replace/remove any number of functions and optionally execute a function
    /// @param _diamondCut Array of FacetCut structs
    /// @param _initAddress Address of contract or facet to execute _calldata
    /// @param _calldata Calldata for optional initialization function
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _initAddress,
        bytes calldata _calldata
    ) external;

    event DiamondCut(FacetCut[] _diamondCut, address _initAddress, bytes _calldata);
}
