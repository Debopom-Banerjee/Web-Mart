// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const Name = 'WebMart'
  const Symbol = 'WebM'

  const WebMart = await ethers.getContractFactory('WebMart')
  const webmart = await WebMart.deploy(Name, Symbol)
  await webmart.deployed()

  console.log(`Deployed Domain Contract at: ${webmart.address}\n`)

  const names = ["example.eth","debopom.eth","random.eth","h2o.eth","banana.eth","tiger.eth"]
  const costs = [tokens(7),tokens(10),tokens(6),tokens(5),tokens(2.5),tokens(1)]

  for(var i = 0;i < 6; i++){
    const transaction = await webmart.connect(deployer).listDomain(names[i], costs[i])
    await transaction.wait()

    console.log(`Listed Domain ${i + 1}: ${names[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
