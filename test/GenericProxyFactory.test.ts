import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('GenericProxyFactory', () => {
  describe('create()', () => {
    it('should create a new instance', async () => {
      const provider = ethers.provider;

      const genericProxyFactoryContract = await ethers.getContractFactory(
        'GenericProxyFactory',
      );

      const hardhatGenericProxyFactory = await genericProxyFactoryContract.deploy()

      const tx = await hardhatGenericProxyFactory.create(
        '0x3A791e828fDd420fbE16416efDF509E4b9088Dd4',
        '0x',
        '0x01'
      );
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const createdEvent = hardhatGenericProxyFactory.interface.parseLog(receipt.logs[0]);

      expect(createdEvent.name).to.equal('ProxyCreated');

      // to do add instance specific tests?

    });
  });
});
