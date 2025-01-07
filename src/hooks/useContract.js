import tokenABI from "../abi/tokenABI.json";
import stakingABI from "../abi/stakingABI.json";
import {
  useContractWrite,
  useContractRead,
  usePrepareContractWrite,
} from "wagmi";
import Contracts from "../contracts/56.json";

export function useTokenContractApproveRead(address) {
  const abi = tokenABI;
  return useContractRead({
    address: Contracts.usdt,
    abi: tokenABI,
    functionName: "allowance",
    watch: true,
    args: [address, Contracts.swap.address],
  });
}

export function useFTTTokenApproveWrite(args) {
  const mono_address = Contracts.usdt;
  const abi = tokenABI;
  return useContractWriteBasic(mono_address, abi, "approve", args);
}

export function useStaking(args) {
  const staking_address = Contracts.swap.address;
  const abi = stakingABI;
  return useContractWriteBasic(staking_address, abi, "deposit", args);
}

export function useWithdraw(args) {
  const staking_address = Contracts.swap.address;
  const abi = stakingABI;
  return useContractWriteBasic(staking_address, abi, "withdraw", args);
}

export function useContractWriteBasic(address, abi, functionName, args) {
  const { config } = usePrepareContractWrite({
    address,
    abi,
    functionName,
    args,
  });
  return useContractWrite(config);
}
