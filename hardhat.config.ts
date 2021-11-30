import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

dotenv.config();

const privateKey = process.env.POLYGON_ACC as string

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_APP_ID}/polygon/mumbai`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://speedy-nodes-nyc.moralis.io/${process.env.MORALIS_APP_ID}/polygon/mainnet`,
      accounts: [privateKey]
    }
  }

};

export default config;
