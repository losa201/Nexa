// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

/// @title VRFConsumer
/// @notice Requests and stores verifiable randomness from Chainlink VRF
contract VRFConsumer is VRFConsumerBase {
    bytes32 public keyHash;
    uint256 public fee;
    uint256 public randomResult;

    event RandomRequested(bytes32 indexed requestId);
    event RandomFulfilled(bytes32 indexed requestId, uint256 randomness);

    /// @param _vrfCoordinator Chainlink VRF Coordinator address
    /// @param _linkToken      LINK token contract address
    /// @param _keyHash        Identifier of the VRF keypair
    /// @param _fee            LINK fee required per request
    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }

    /// @notice Initiates a randomness request
    /// @return requestId the identifier of the VRF request
    function requestRandomness() external returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        requestId = requestRandomness(keyHash, fee);
        emit RandomRequested(requestId);
    }

    /// @dev Callback used by VRF Coordinator to return the random number
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        emit RandomFulfilled(requestId, randomness);
    }
}
