// exports a generic factoryDeploy using the generic minimal proxy factories
import chalk from 'chalk';
import { getChainByChainId } from "evm-chains"
import { Signer } from "ethers"
import { existsSync, writeFileSync } from 'fs';
import  { ethers, getChainId } from "hardhat"


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
    abi: any
}

export async function factoryDeploy(deploySettings: DeploySettings){
    // get address of minimal proxy factory
    // const allDeployments = await deployments.all() // cant use this in pure package.
    const genericProxyFactoryAddress = "" // change to function which gets per network --> constants file?

    //get network name
    const networkName = await getChainByChainId(parseInt(await getChainId())).name

    if(!genericProxyFactoryAddress){
        throw new Error(`No GenericProxyFactory deployed for this network ()`)
    }
    if(deploySettings.initializeData && !deploySettings.abi){
        throw new Error(`Initialize data provided but no ABI`)
    }

    if(deploySettings.overWrite && existsSync(`./deployments/${networkName}/${deploySettings.contractName}.json`)){
        cyan(`Using existing implementation for ${deploySettings.contractName}`)
        return
    }

    cyan(`genericProxyFactory for network ${await getChainByChainId(parseInt(await getChainId())).chain} at address ${genericProxyFactoryAddress}`)

    // grab abi and create contract instance
    const genericProxyFactoryContract = await ethers.getContractAt("GenericProxyFactory", genericProxyFactoryAddress, deploySettings.signer)

    const createProxyResult = await genericProxyFactoryContract.create(deploySettings.implementationAddress, deploySettings.initializeData)

    await ethers.provider.waitForTransaction(createProxyResult.hash)

    const receipt = await ethers.provider.getTransactionReceipt(createProxyResult.hash);
  
    const createdEvent = genericProxyFactoryContract.interface.parseLog(receipt.logs[0]);
    green(`Proxy for ${deploySettings.contractName} created at ${createdEvent.args.created}`)

    const jsonObj: ProxyDeployment = {
        address: createdEvent.args.created,
        transactionHash: receipt.transactionHash,
        receipt: receipt,
        args: deploySettings?.initializeData,
        bytecode: `${await ethers.provider.getCode(createdEvent.args.created)}`
    }
    const pathFile = `./deployments/${networkName}/${deploySettings.contractName}.json`
    dim(`Deployments file saved at ${pathFile}`)
    writeFileSync(pathFile, JSON.stringify(jsonObj), {encoding:'utf8',flag:'w'})

    // now call intializer if applicable
    if(deploySettings.initializeData){
        dim(`calling passed function`)
        const instanceContract = await ethers.getContractAt(deploySettings.abi, createdEvent.args.created, deploySettings.signer)
        await instanceContract.initialize(deploySettings.initializeData) // will this always be intialize? 
    }

}
