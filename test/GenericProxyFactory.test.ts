import { expect } from 'chai';
import { deployMockContract, MockContract } from 'ethereum-waffle';
import { Contract, ContractFactory, Signer } from 'ethers';
import { ethers } from 'hardhat';
import * as hre from "hardhat"

describe('GenericProxyFactory', () => {
    let genericProxyFactoryContract: ContractFactory
    let hardhatGenericProxyFactory: Contract
    let testErc20Contract: Contract
    let testSigner : Signer

    describe('create functions', () => {
        let predictedAddress: string
        
        before(async () => {
            

            genericProxyFactoryContract = await ethers.getContractFactory('GenericProxyFactory');
            hardhatGenericProxyFactory = await genericProxyFactoryContract.deploy()

            testSigner = (await ethers.getSigners())[0]
            testErc20Contract = await (await ethers.getContractFactory("ERC20")).deploy("test", "TEST", 18)
        })

        it('should create a new instance', async () => {
            const erc20ContractInterface = new ethers.utils.Interface((await hre.artifacts.readArtifact("ERC20")).abi)            
            const createTx = await hardhatGenericProxyFactory.create(
                testErc20Contract.address,
                erc20ContractInterface.encodeFunctionData(erc20ContractInterface.getFunction("decimals()"))
            );

            
            const receipt = await ethers.provider.getTransactionReceipt(createTx.hash);
            const createdEvent = hardhatGenericProxyFactory.interface.parseLog(receipt.logs[0]);

            expect(createdEvent.name).to.equal('ProxyCreated');

        });

        it('should create a new instance and not call any function', async () => {

            expect(await hardhatGenericProxyFactory.create(
                testErc20Contract.address,
                "0x"
            ));
        });

        it('should create a new instance and call passed data', async () => {
            const erc20ContractInterface = new ethers.utils.Interface((await hre.artifacts.readArtifact("ERC20")).abi)            
            
            expect(await hardhatGenericProxyFactory.create(
                testErc20Contract.address,
                erc20ContractInterface.encodeFunctionData(erc20ContractInterface.getFunction("decimals()"))
            ));
        });

        it('should create a new instance and revert on passed data', async () => {
            const erc20ContractInterface = new ethers.utils.Interface((await hre.artifacts.readArtifact("ERC20")).abi)            
            
            await expect(hardhatGenericProxyFactory.create(
                testErc20Contract.address,
                erc20ContractInterface.encodeFunctionData(erc20ContractInterface.getFunction("willRevert()"))
            )).to.be.revertedWith("ERC20-willRevert")
        });



        it('should return the predicted addreess', async () => {
            predictedAddress = await hardhatGenericProxyFactory.predictDeterministicAddress(
                testErc20Contract.address,
                ethers.utils.solidityKeccak256(["uint8"], ["0x01"]),
            ); 
        })

        it('should determinstically create a new instance and call a function', async () => {
            const erc20ContractInterface = new ethers.utils.Interface((await hre.artifacts.readArtifact("ERC20")).abi)  

            const createTx = await hardhatGenericProxyFactory.create2(
                testErc20Contract.address,
                ethers.utils.solidityKeccak256(["uint8"], ["0x01"]),
                erc20ContractInterface.encodeFunctionData(erc20ContractInterface.getFunction("decimals()"))
            ); 
            const receipt = await ethers.provider.getTransactionReceipt(createTx.hash);
            const createdEvent = hardhatGenericProxyFactory.interface.parseLog(receipt.logs[0]);

            expect(createdEvent.name).to.equal('ProxyCreated');
            
            expect(createdEvent.args.implementation).to.equal(testErc20Contract.address)  
            expect(createdEvent.args.created).to.equal(predictedAddress)
        })

        it('should determinstically create a new instance', async () => {
            
            expect(await hardhatGenericProxyFactory.create2(
                testErc20Contract.address,
                ethers.utils.solidityKeccak256(["uint8"], ["0x02"]),
                "0x"
            ))
        })

        it('should fail to deterministically create a contract with a clashing salt', async () => {
            
            await expect(hardhatGenericProxyFactory.create2(
                testErc20Contract.address,
                ethers.utils.solidityKeccak256(["uint8"], ["0x02"]),
                "0x"
            )).to.be.revertedWith("ERC1167: create2 failed")
        })

    });

});
