// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockMetricOracle {
    // shardId → epoch → fake “encrypted” metrics blob
    mapping(uint256 => mapping(uint256 => bytes)) public data;

    event MetricsSet(uint256 indexed shardId, uint256 indexed epoch, bytes blob);

    /// @notice Owner sets the metrics blob (could be off‑chain encrypted)
    function setMetrics(uint256 shardId, uint256 epoch, bytes calldata blob) external {
        data[shardId][epoch] = blob;
        emit MetricsSet(shardId, epoch, blob);
    }

    function getEncryptedMetrics(uint256 shardId, uint256 epoch) external view returns (bytes memory) {
        return data[shardId][epoch];
    }
}
