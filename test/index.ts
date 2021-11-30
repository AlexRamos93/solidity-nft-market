import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { ethers } from "hardhat";

let marketContract: Contract
let nftContract: Contract
let marketAddr: string
let nftAddr: string

interface CreateMarketItemArgs {
  value: string
}

interface MarketItem {
  price: string
  tokenId: string
  seller: string
  owner: string
  tokenURI: string
}

describe("NFT Market", async () => {
  it("Should create a nft and put to sale", async () => {
    await setup()
    const listingPrice = (await marketContract.getListingPrice()).toString()
    await createNFT('https://www.urinft.com')
    await createNFT('https://www.urinft2.com')
    await createMarketItem(nftAddr, 1, parseUnits('100'), { value: listingPrice })
    await createMarketItem(nftAddr, 2, parseUnits('10'), { value: listingPrice })

    const items = await marketContract.fetchMarketItems();
    const parsedItems = await formatItems(items)
    checkItemMarket(parsedItems[0], parseUnits('100').toString(), 'https://www.urinft.com')
    checkItemMarket(parsedItems[1], parseUnits('10').toString(),'https://www.urinft2.com' )
  })
  it('Should execute a sale', async () => {
    const [_, buyerAddr] = await ethers.getSigners()
    await marketContract.connect(buyerAddr).createMarketSale(nftAddr, 1, { value: parseUnits('100') })
    const items = await marketContract.connect(buyerAddr).fetchMyNFTs();
    const parsedItems = await formatItems(items)
    checkItemMarket(parsedItems[0], parseUnits('100').toString(), 'https://www.urinft.com', buyerAddr.address)
  })
});

const setup = async (): Promise<void> => {
  marketContract = await deployContract('NFTMarket')
  marketAddr = getContractAddr(marketContract)
  nftContract = await deployContract('NFT', marketAddr)
  nftAddr = getContractAddr(nftContract)
}

const deployContract = async (contractName: string, contructor?: string): Promise<Contract> => {
  const contractFactory = await ethers.getContractFactory(contractName)
  const contract = await contractFactory.deploy(contructor ?? null)
  await contract.deployed()
  return contract
}

const getContractAddr = (contract: Contract): string => contract.address

const createNFT = async (uri: string): Promise<void> => await nftContract.createToken(uri)

const createMarketItem = (address: string, id: number, price: BigNumber, args: CreateMarketItemArgs): Promise<void> =>
  marketContract.createMarketItem(address, id, price, args)

const formatItems = async (items: any[]): Promise<MarketItem[]> => {
  return Promise.all(items.map(async i => {
    const uri = await nftContract.tokenURI(i.tokenId)
    return {
      price: i.price.toString(),
      tokenId: i.tokenId.toString(),
      seller: i.seller,
      owner: i.owner,
      tokenURI: uri
    }
  }))
}

const checkItemMarket = (item: MarketItem, price: string, uri: string, owner?: string) => {
  console.log('SINGLE', item)
  expect(item.owner).to.be.eql(owner ?? '0x0000000000000000000000000000000000000000')
  expect(item.seller).to.be.eql('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  expect(item.price).to.be.eql(price)
  expect(item.tokenURI).to.be.eql(uri)
}

const parseUnits = (value: string) => ethers.utils.parseUnits(value, 'ether')