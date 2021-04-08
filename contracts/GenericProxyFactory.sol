// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "hardhat/console.sol";

/// @title PoolTogether Generic Minimal ProxyFactory
/// @notice EIP-1167 Minimal proxy factory pattern for creating proxy contracts
contract GenericProxyFactory{
  
  ///@notice Event fired when minimal proxy has been created
  event ProxyCreated(address indexed created, address indexed implementation);

  /// @notice Create a proxy contract for given instance
  /// @param _instance Contract implementation which the created contract will point at
  /// @param _data Data which is to be called after the proxy contract is created
  function create(address _instance, bytes calldata _data) public
  returns (address instanceCreate) {
    
    address instanceCreated = ClonesUpgradeable.clone(_instance);
    emit ProxyCreated(instanceCreated, _instance);

    console.log("now calling passed data ");

    if(_data.length > 0) {
      (bool success, bytes memory result) = instanceCreated.call(_data);
      require(success, "GenericProxyFactory/call-failed");
    }

    return instanceCreated;
  }

  /// @notice Create a proxy contract with a deterministic address using create2
  /// @param _instance Contract implementation which the created contract will point at
  /// @param _salt Salt which is used as the create2 salt
  /// @param _data Data which is to be called after the proxy contract is created
  function create2(address _instance, bytes32 _salt, bytes calldata _data) public returns (address) {

    address instanceCreated = ClonesUpgradeable.cloneDeterministic(_instance, _salt);
    emit ProxyCreated(instanceCreated, _instance);

    if(_data.length > 0) {
      (bool success,) = instanceCreated.call(_data);
      require(success, "GenericProxyFactory/call-failed");
    }

    return instanceCreated;
  }

  /// @notice Calculates what the proxy address would be when deterministically created
  /// @param _master Contract implementation which the created contract will point at
  /// @param _salt Salt which would be used as the create2 salt
  function predictDeterministicAddress(address _master, bytes32 _salt) public view returns (address) {
    return ClonesUpgradeable.predictDeterministicAddress(_master, _salt, address(this));
  }

}
