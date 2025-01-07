import { ethers } from "ethers";
import Contrats from "./56.json";
const rpc = "https://eth-pokt.nodies.app";
const provider = new ethers.providers.JsonRpcProvider(rpc)
const swapContract = new ethers.Contract(Contrats.swap.address, Contrats.swap.abi, provider);
const zeroAddress = ethers.constants.AddressZero;
const usdtAddress = Contrats.usdt;
const usdtContract = new ethers.Contract(Contrats.usdt, Contrats.erc20Abi, provider);
const ERC20ABI = Contrats.erc20Abi;

export {
    zeroAddress, provider, swapContract, usdtAddress, usdtContract, ERC20ABI
}