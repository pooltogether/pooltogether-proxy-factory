// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.0 <0.7.0;

import "./external/openzeppelin/ProxyFactory.sol";

/// @title PoolTogether Generic Minimal ProxyFactory
/// @notice EIP-1167 Minimal proxy factory pattern for creating proxy contracts
contract GenericProxyFactory is ProxyFactory {

  /// @notice
  constructor () public {
    // blank?
  }

  /// @notice 
  function create(address instance, bytes calldata data) public returns (address) {
    address instanceCreated = deployMinimal(instance, data);

    // aTokenYieldSource.initialize(_aToken, _lendingPoolAddressesProviderRegistry, _decimals, _name, _symbol);
    // aTokenYieldSource.transferOwnership(_owner);

    return instanceCreated;
  }
}
