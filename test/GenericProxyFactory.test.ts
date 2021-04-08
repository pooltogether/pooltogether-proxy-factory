import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('GenericProxyFactory', () => {
    let genericProxyFactoryContract: any
    let hardhatGenericProxyFactory: any

    describe('create functions', () => {
        let predictedAddress: string

        before(async () => {
            genericProxyFactoryContract = await ethers.getContractFactory('GenericProxyFactory');
            hardhatGenericProxyFactory = await genericProxyFactoryContract.deploy()
        })

        it('should create a new instance', async () => {
            const createTx = await hardhatGenericProxyFactory.create(
                '0x3A791e828fDd420fbE16416efDF509E4b9088Dd4',
                '0x'
            );
            const receipt = await ethers.provider.getTransactionReceipt(createTx.hash);
            const createdEvent = hardhatGenericProxyFactory.interface.parseLog(receipt.logs[0]);

            expect(createdEvent.name).to.equal('ProxyCreated');
        });

        it('should return the predicted addreess', async () => {
            predictedAddress = await hardhatGenericProxyFactory.predictDeterministicAddress(
                '0x3A791e828fDd420fbE16416efDF509E4b9088Dd4',
                ethers.utils.solidityKeccak256(["uint8"], ["0x01"]),
            ); 
        })

        it('should determinstically create a new instance', async () => {
            const createTx = await hardhatGenericProxyFactory.create2(
                '0x3A791e828fDd420fbE16416efDF509E4b9088Dd4',
                ethers.utils.solidityKeccak256(["uint8"], ["0x01"]),
                '0x'
            ); 
            const receipt = await ethers.provider.getTransactionReceipt(createTx.hash);
            const createdEvent = hardhatGenericProxyFactory.interface.parseLog(receipt.logs[0]);

            expect(createdEvent.name).to.equal('ProxyCreated');
            
            expect(createdEvent.args.implementation).to.equal("0x3A791e828fDd420fbE16416efDF509E4b9088Dd4")  
            expect(createdEvent.args.created).to.equal(predictedAddress)
        })

    });

    describe('create and call data', () => {
        //todo

    })
});
