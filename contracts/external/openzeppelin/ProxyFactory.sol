// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

// solhint-disable no-inline-assembly
// solhint-disable avoid-low-level-calls
contract ProxyFactory {

  event ProxyCreated(address proxy);

  function deployMinimal(address _logic, bytes memory _data, bytes memory salt) public returns (address instance) {
    // Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/proxy/Clones.sol#L43
    assembly {
      let ptr := mload(0x40)
      mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(ptr, 0x14), shl(0x60, _logic))
      mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      instance := create2(0, ptr, 0x37, salt)
    }
    require(instance != address(0), "ERC1167: create2 failed");
    emit ProxyCreated(address(instance));

    if(_data.length > 0) {
      (bool success,) = instance.call(_data);
      require(success, "ProxyFactory/constructor-call-failed");
    }
  }
}
