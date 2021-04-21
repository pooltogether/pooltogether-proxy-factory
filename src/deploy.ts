// exports a generic factoryDeploy using the generic minimal proxy factories
import chalk from 'chalk';
import { getChainByChainId } from "evm-chains"
import { Signer } from "ethers"
import { existsSync, writeFileSync } from 'fs';
import  { deployments, ethers, getChainId } from "hardhat"


const displayLogs = !process.env.HIDE_DEPLOY_LOG;

function dim(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.dim(logMessage));
  }
}

function cyan(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.cyan(logMessage));
  }
}

function yellow(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.yellow(logMessage));
  }
}

function green(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.green(logMessage));
  }
}


interface ProxyDeployment {
    address?: string
    abi?: any
    transactionHash?: string
    receipt?: any
    args?: any
    bytecode?: string
}

interface DeploySettings {
    implementationAddress: string
    contractName: string
    overWrite?: boolean
    signer: any // replace with Signer type from ethers
    initializeData?: any // string?
}

export async function factoryDeploy(deploySettings: DeploySettings){
    // get address of minimal proxy factory
    const allDeployments = await deployments.all()
    const genericProxyFactory = allDeployments.GenericProxyFactory

    if(!genericProxyFactory){
        throw new Error(`No GenericProxyFactory deployed for this network ()`)
    }

    //get network name
    const networkName = await getChainByChainId(parseInt(await getChainId())).name

    if(deploySettings.overWrite && existsSync(`./deployments/${networkName}/${deploySettings.contractName}.json`)){
        cyan(`Using existing implementation for ${deploySettings.contractName}`)
        return
    }

    cyan(`genericProxyFactory for network ${await getChainByChainId(parseInt(await getChainId())).chain} at address ${genericProxyFactory.address}`)

    // grab abi and create contract instance
    const genericProxyFactoryContract = await ethers.getContractAt("GenericProxyFactory", genericProxyFactory.address, deploySettings.signer)

    const createProxyResult = await genericProxyFactoryContract.create(deploySettings.implementationAddress, deploySettings.initializeData)

    await ethers.provider.waitForTransaction(createProxyResult.hash)

    const receipt = await ethers.provider.getTransactionReceipt(createProxyResult.hash);
  
    const createdEvent = genericProxyFactoryContract.interface.parseLog(receipt.logs[0]);
    // green(`aToken proxy for ${aTokenEntry.aTokenSymbol} created at ${createdEvent.args.created}`)

    const jsonObj: ProxyDeployment = {
        address: createdEvent.args.created,
        transactionHash: receipt.transactionHash,
        receipt: receipt,
        args: deploySettings?.initializeData,
        bytecode: `${await ethers.provider.getCode(createdEvent.args.created)}`
    }

    writeFileSync(`./deployments/${networkName}/${deploySettings.contractName}.json`, JSON.stringify(jsonObj), {encoding:'utf8',flag:'w'})

}
