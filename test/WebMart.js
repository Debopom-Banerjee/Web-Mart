const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("WebMart", () => {
  let webmart
  let deployer, owner1
  const Name = 'WebMart'
  const Symbol = 'WebM'

  beforeEach(async() =>{
    [deployer, owner1] = await ethers.getSigners()
    
    // Deploy Contract
    const WebMart = await ethers.getContractFactory('WebMart')
    webmart = await WebMart.deploy(Name, Symbol)

    // List a Domain
    const transaction = await webmart.connect(deployer).listDomain("Deb.eth", tokens(10))
    await transaction.wait()
  })
  describe('Deployment', () =>{
    it('has a name', async() => {
      const result = await webmart.name()
      expect(result).to.equal(Name)
    })
    it('has a symbol', async() => {
      const result = await webmart.symbol()
      expect(result).to.equal(Symbol)
    })
    it('Sets the Owner', async() => {
      const result = await webmart.owner()
      expect(result).to.equal(deployer.address)
    })
    it('Returns max Supply', async() => {
      const result = await webmart.maxSupply()
      expect(result).to.equal(1)
    })
    it('Returns total Supply', async() => {
      const result = await webmart.totalSupply()
      expect(result).to.equal(0)
    })
  })
  describe("Domain", () =>{
    it('Return domain attributes', async() => {
      let domain = await webmart.getDomain(1);
      expect(domain.name).to.be.equal("Deb.eth")
      expect(domain.cost).to.be.equal(tokens(10))
      expect(domain.isOwned).to.be.equal(false)
    })
  })
  describe("Minting", () =>{
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10",'ether')
    beforeEach(async () =>{
      const transaction = await webmart.connect(owner1).mint(ID,{value:AMOUNT})
      await transaction.wait()
    })
    it('Updates the owner', async() => {
      const owner = await webmart.ownerOf(ID)
      expect(owner).to.be.equal(owner1.address)
    })
    it('Updates the domain status', async() => {
      const domain = await webmart.getDomain(ID)
      expect(domain.isOwned).to.be.equal(true)
    })
    it('Updates the contract balance', async() => {
      const result = await webmart.getBalance()
      expect(result).to.be.equal(AMOUNT)
    })
  })
  describe("Withdrawing", () =>{
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10",'ether')
    let balanceBefore

    beforeEach(async () =>{
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await webmart.connect(owner1).mint(ID,{value:AMOUNT})
      await transaction.wait()

      transaction = await webmart.connect(deployer).withdraw()
      await transaction.wait()
    })
    it('Updates the owner balance', async() => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })
    it('Updates the contract balance', async() => {
      const result = await webmart.getBalance()
      expect(result).to.equal(0)
    })
  })
})
