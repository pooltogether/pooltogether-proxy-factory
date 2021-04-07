// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./external/openzeppelin/ProxyFactory.sol";

/// @title PoolTogether Generic Minimal ProxyFactory
/// @notice EIP-1167 Minimal proxy factory pattern for creating proxy contracts
contract GenericProxyFactory is ProxyFactory {

  /// @notice
  constructor () public {
    // blank?
  }

  /// @notice 
  function create(address instance, bytes calldata data, bytes calldata salt) public returns (address) {
    address instanceCreated = deployMinimal(instance, data, salt);

    // aTokenYieldSource.initialize(_aToken, _lendingPoolAddressesProviderRegistry, _decimals, _name, _symbol);
    // aTokenYieldSource.transferOwnership(_owner);

    return instanceCreated;
  }
}
