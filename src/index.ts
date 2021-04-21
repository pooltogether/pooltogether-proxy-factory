import * as deploy from "./deploy"

deploy.factoryDeploy({implementationAddress: "0x",
                         contractName: "name",
                         signer: "signer",
                         initializeData: "0xData"})

module.exports = {
    deploy
}