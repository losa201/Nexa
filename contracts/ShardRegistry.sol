// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShardRegistry {
    mapping(uint256 => mapping(uint256 => bytes32)) public roots;
    event RootRegistered(uint256 indexed epoch, uint256 indexed shardId, bytes32 root);

    function registerRoot(uint256 epoch, uint256 shardId, bytes32 root) external {
        require(roots[epoch][shardId] == bytes32(0), "Already registered");
        roots[epoch][shardId] = root;
        emit RootRegistered(epoch, shardId, root);
    }

    function getRoot(uint256 epoch, uint256 shardId) external view returns (bytes32 root) {
        root = roots[epoch][shardId];
        require(root != bytes32(0), "Not registered");
    }
}
