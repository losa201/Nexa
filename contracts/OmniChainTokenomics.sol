// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

/// @title OmniChainTokenomics
/// @notice Enables cross‑chain propagation of tokenomics proposals via LayerZero
contract OmniChainTokenomics is NonblockingLzApp {
    struct Proposal {
        uint256 shardId;
        uint256 epoch;
        uint32 inflationBP;
        uint16 baseFeeBP;
        uint32 slashingBP;
        uint32 rewardSlope;
        uint32 rewardOffset;
    }

    event CrossChainProposal(
        uint16 indexed dstChainId,
        bytes indexed to,
        Proposal proposal
    );
    event ProposalReceived(
        uint16 indexed srcChainId,
        Proposal proposal
    );

    /// @param _lzEndpoint LayerZero endpoint for this chain
    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}

    /// @notice Send a proposal payload to a remote chain
    function sendProposal(
        uint16 dstChainId,
        bytes calldata to,
        Proposal calldata p
    ) external payable {
        bytes memory payload = abi.encode(p);
        // _lzSend: (dstChainId, payload, refundAddress, zroPaymentAddress, adapterParams)
        _lzSend(dstChainId, payload, payable(msg.sender), address(0), bytes(""));
        emit CrossChainProposal(dstChainId, to, p);
    }

    /// @dev LayerZero entrypoint for incoming messages
    function _nonblockingLzReceive(
        uint16 srcChainId,
        bytes memory,          // _from (not used)
        uint64,                // _nonce (not used)
        bytes memory payload
    ) internal override {
        Proposal memory p = abi.decode(payload, (Proposal));
        // Here you could apply or store the proposal locally
        emit ProposalReceived(srcChainId, p);
    }

    /// @notice Required override, but we do not need to block on failures
    function _blockingLzReceive(
        uint16,
        bytes memory,
        uint64,
        bytes memory
    ) internal pure override {
        revert("Unsupported");
    }
}
