// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title DynamicFee
/// @notice Implements an AMM‑style bonding curve to set base fees dynamically based on demand
contract DynamicFee {
    /// @notice Total ETH reserve contributed for fees
    uint256 public reserveETH;
    /// @notice Total “units” (e.g., gas units) recorded
    uint256 public reserveUnits;

    event FeeUpdated(uint256 newBaseFee);
    event FeePaid(address indexed payer, uint256 gasUsed, uint256 amountPaid);

    /// @notice Update reserves based on actual gas used; caller must send ETH equal to fee
    /// @param gasUsed The gas units consumed in the associated transaction
    function payFee(uint256 gasUsed) external payable {
        uint256 currentFee = _currentFee();
        uint256 required = (gasUsed * currentFee) / 1e9;
        require(msg.value >= required, "Fee too low");
        reserveETH += msg.value;
        reserveUnits += gasUsed;
        emit FeePaid(msg.sender, gasUsed, msg.value);
        emit FeeUpdated(currentFee);
        // refund any dust
        if (msg.value > required) {
            payable(msg.sender).transfer(msg.value - required);
        }
    }

    /// @notice Compute the current fee rate (wei per gas unit × 1e9 for precision)
    function currentFee() external view returns (uint256) {
        return _currentFee();
    }

    /// @dev Internal function: if no units yet, fee is zero
    function _currentFee() internal view returns (uint256) {
        if (reserveUnits == 0) {
            return 0;
        }
        // Fee = (reserveETH * 1e9) / reserveUnits
        return (reserveETH * 1e9) / reserveUnits;
    }

    /// @notice Allows manual injection of ETH to adjust the bonding curve (e.g., protocol treasuries)
    function injectReserve() external payable {
        reserveETH += msg.value;
        emit FeeUpdated(_currentFee());
    }
}
