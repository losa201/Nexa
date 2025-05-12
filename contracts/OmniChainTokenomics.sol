// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/IOFT.sol";

/// @title OmniChainTokenomics
/// @notice Handles tokenomics actions across multiple chains using LayerZero OFT
contract OmniChainTokenomics is Ownable, Pausable, ReentrancyGuard {
    /// @notice Emitted when tokens are minted
    event TokensMinted(address indexed to, uint256 amount, uint16 dstChainId, uint256 timestamp);
    /// @notice Emitted when tokens are burned
    event TokensBurned(address indexed from, uint256 amount, uint16 srcChainId, uint256 timestamp);

    IOFT public immutable token;

    constructor(address _token) {
        require(_token != address(0), "Token address zero");
        token = IOFT(_token);
    }

    function mintAcrossChain(
        address to,
        uint256 amount,
        uint16 dstChainId
    ) external onlyOwner whenNotPaused nonReentrant {
        token.mint(address(this), amount);
        token.sendFrom{value: msg.value}(address(this), dstChainId, to, amount, payable(msg.sender));
        emit TokensMinted(to, amount, dstChainId, block.timestamp);
    }

    function lzReceive(
        uint16 srcChainId,
        bytes calldata, /* path */
        address toAddress,
        uint256 amount
    ) external payable nonReentrant {
        require(msg.sender == address(token), "Unauthorized caller");
        token.burn(toAddress, amount);
        emit TokensBurned(toAddress, amount, srcChainId, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
