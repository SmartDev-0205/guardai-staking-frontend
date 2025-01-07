import { useState, useEffect, useMemo } from "react";
import { Contract, ethers } from "ethers";
import { useWeb3Modal } from "@web3modal/react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { providers } from "ethers";
import { formatUnits, parseEther, parseUnits } from "viem";
import { type WalletClient, useWalletClient } from "wagmi";
import Contrats from "../contracts/56.json";
import Container from "../components/containers/Container";
import FilledButton from "../components/buttons/FilledButton";
import { TOKENS } from "../utils/consts";
import stakingABI from "../abi/stakingABI.json";
import { useContractRead } from "wagmi";
import { useWaitForTransaction } from "wagmi";
import logoImg from "../assets/images/logo.png";
import {
  useFTTTokenApproveWrite,
  useStaking,
  useTokenContractApproveRead,
  useWithdraw,
} from "../hooks/useContract";
import CustomDialog from "../components/dialogs/CustomDialog";
import LoadingDialog from "../components/dialogs/LoadingDialog";
import { toast } from "react-toastify";

const chainId = process.env.REACT_APP_CHAIN_ID;
const CONTRACT_ADDRESS = Contrats.swap.address as `0x${string}`;
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  if (chain.id !== parseInt(chainId!)) return;
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}

export default function Blank() {
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [dexVersion, setDexVersion] = useState<string>("v2");

  const [visible, setVisible] = useState<boolean>(false);
  const [sourceToken, setSource] = useState<IToken>(TOKENS[0]);
  const [targetToken, setTarget] = useState<IToken>(TOKENS[1]);
  const [isApproved, setIsApproved] = useState(true);
  const [loadingVisible, setLoadingVisible] = useState(false);

  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  const firstOption: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "poolInfo",
    args: [0],
  });

  const secondOption: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "poolInfo",
    args: [1],
  });

  const thirdOption: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "poolInfo",
    args: [2],
  });

  const firstInfo: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "userInfo",
    args: [0, address],
    enabled: !!address,
    watch: true,
  });
  const secondInfo: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "userInfo",
    args: [1, address],
    enabled: !!address,
    watch: true,
  });
  const thirdInfo: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "userInfo",
    args: [2, address],
    enabled: !!address,
    watch: true,
  });

  const firstPending: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "pendingReward",
    args: [0, address],
    enabled: !!address,
    watch: true,
  });
  const secondPending: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "pendingReward",
    args: [1, address],
    enabled: !!address,
    watch: true,
  });
  const thirdPending: any = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: "pendingReward",
    args: [2, address],
    enabled: !!address,
    watch: true,
  });

  const [withdrawOption, setWithdrawOption] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [isClaimed, setIsClaimed] = useState(false);

  const { data: approveData, write: approveWrite } = useFTTTokenApproveWrite([
    CONTRACT_ADDRESS,
    parseEther("500000000"),
  ]);
  const withdrawData = useWithdraw([withdrawOption, withdrawAmount]);

  const allowanceData: any = useTokenContractApproveRead(address);

  const [stakingAmount, setStakingAmount] = useState(0);
  const [option, setOption] = useState(0);

  const stakingData = useStaking([
    option,
    parseUnits(stakingAmount.toString(), 18),
  ]);

  useEffect(() => {
    if (allowanceData.data) {
      let allowData: any = formatUnits(allowanceData.data, 18);
      if (parseInt(allowData) > 0) setIsApproved(true);
      else setIsApproved(true);
    }
  }, [allowanceData]);

  const onApprove = () => {
    approveWrite && approveWrite();
    //
  };

  const onStake = () => {
    setVisible(true);
    //
  };

  const stakeWait = useWaitForTransaction({
    hash: stakingData.data?.hash,
    onSuccess(data) {
      setLoadingVisible(false);
      // window.location.reload();
    },
    onError(data) {
      setLoadingVisible(false);
      // window.location.reload();
    },
  });

  const handleClaim = (option: any, amount: any) => {
    console.log("🚀 ~ file: Home.tsx:314 ~ handleClaim ~ amount:", amount);
    setWithdrawOption(option);
    switch (option) {
      case 0:
        setWithdrawAmount(firstInfo.data?.at(0));

        break;
      case 1:
        setWithdrawAmount(secondInfo.data?.at(0));

        break;
      case 2:
        setWithdrawAmount(thirdInfo.data?.at(0));
        break;

      default:
        break;
    }
    // setWithdrawAmount(amount);
    setIsClaimed(true);
  };

  useEffect(() => {
    if (isClaimed) {
      withdrawData.write && withdrawData.write();
    }
    setIsClaimed(false);
  }, [withdrawOption, withdrawAmount, isClaimed]);

  const withdrawWait = useWaitForTransaction({
    hash: withdrawData.data?.hash,
    onSuccess(data) {
      setLoadingVisible(false);
    },
    onError(data) {
      setLoadingVisible(false);
    },
  });

  const currentTimestamp = () => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    Math.round(timestamp / 1000);
    return Math.round(timestamp / 1000);
  };

  const stakingOptions = [
    {
      id: 1,
      // stakeDay: firstOption && firstOption.data?.at(4).toString(),
      stakeDay: 180,
      currentApy: "45",
      youStaked: Math.round(
        parseFloat(
          formatUnits(firstInfo.data ? firstInfo.data?.at(0) : BigInt(0), 18) ||
            "0"
        )
      ),
      totalStakedPool: Math.round(
        parseFloat(
          formatUnits(
            firstOption.data ? firstOption.data?.at(2) : BigInt(0),
            18
          ) || "0"
        )
      ),
      canClaim:
        Number(firstInfo.data?.at(2)) != 0
          ? Number(firstInfo.data?.at(2)) < currentTimestamp() &&
            Number(firstInfo.data?.at(0)) > 0
          : false,
      pendingAmount: parseFloat(
        formatUnits(firstPending.data ? firstOption.data : BigInt(0), 18) || "0"
      ).toFixed(2),
    },
    {
      id: 2,
      // stakeDay: secondOption && secondOption.data?.at(4).toString(),
      stakeDay: 270,
      // currentApy: secondOption && secondOption.data?.at(3).toString(),
      currentApy: "60",
      youStaked: Math.round(
        parseFloat(
          formatUnits(
            secondInfo.data ? secondInfo.data?.at(0) : BigInt(0),
            18
          ) || "0"
        )
      ),
      // yourReward: secondPending ? Math.round(parseFloat(formatUnits(secondPending?.data, 18)) * 100) / 100 : 0,
      totalStakedPool: parseFloat(
        formatUnits(
          secondOption.data ? secondOption.data?.at(2) : BigInt(0),
          18
        ) || "0"
      ).toFixed(2),
      canClaim:
        Number(secondInfo.data?.at(2)) != 0
          ? Number(secondInfo.data?.at(2)) < currentTimestamp() &&
            Number(secondInfo.data?.at(0)) > 0
          : false,
      pendingAmount: parseFloat(
        formatUnits(secondPending.data ? secondPending.data : BigInt(0), 18) ||
          "0"
      ).toFixed(2),
    },
    {
      id: 3,
      stakeDay: 365,
      currentApy: "65",
      youStaked: Math.round(
        parseFloat(
          formatUnits(thirdInfo.data ? thirdInfo.data?.at(0) : BigInt(0), 18) ||
            "0"
        )
      ),
      // yourReward: thirdPending ? Math.round(parseFloat(formatUnits(thirdPending?.data, 18)) * 100) / 100 : 0,
      totalStakedPool: Math.round(
        parseFloat(
          formatUnits(
            thirdOption.data ? thirdOption.data?.at(2) : BigInt(0),
            18
          ) || "0"
        )
      ),
      canClaim:
        Number(thirdInfo.data?.at(2)) != 0
          ? Number(thirdInfo.data?.at(2)) < currentTimestamp() &&
            Number(thirdInfo.data?.at(0)) > 0
          : false,
      pendingAmount: parseFloat(
        formatUnits(thirdPending.data ? thirdPending.data : BigInt(0), 18) ||
          "0"
      ).toFixed(2),
    },
  ];

  return (
    <section className="h-full flex flex-col justify-center items-center pt-[50px] gap-5 sm:pt-0 sm:gap-10">
      <div className="flex flex-col gap-1 items-center">
        <Container className="border rounded-full border-[#152834] min-h-[60px] px-3 inline-flex max-w-[400px] w-full mx-auto justify-between items-center">
          {/* <h1 className="flex gap-6 items-center justify-between text-lg font-bold">
          GuardAI
        </h1> */}
          <img
            src={logoImg}
            alt="logo"
            className="h-[30px] sm:h-[40px] "
            loading="lazy"
          />
          <div className="flex items-center gap-8">
            {isConnected ? (
              chain?.id === Number(chainId) ? (
                <FilledButton
                  className="connect-wallet font-bold text-md"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </FilledButton>
              ) : (
                <FilledButton
                  className="connect-wallet font-bold text-md"
                  onClick={() => switchNetwork?.(Number(chainId))}
                >
                  Switch network
                </FilledButton>
              )
            ) : (
              <FilledButton
                className="connect-wallet font-bold text-md "
                onClick={() => open()}
              >
                Connect Wallet
              </FilledButton>
            )}
          </div>
        </Container>

        <FilledButton className=" font-bold text-sm !px-2 !py-1 text-base font-semibold bg-[#182b48]">
          <a href="https://staking.buyguard.io/" target="_blank">
            New staking
          </a>
        </FilledButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 h-fit pt-6 pb-4 gap-10">
        {stakingOptions.map((stake, index) => (
          <div className="relative h-fit" key={index}>
            <div className="container max-w-lg">
              <div className="py-6 px-6 bg-[#081117] flex flex-col gap-[10px] w-[350px] rounded-lg border text-[#f8f8f9] shadow-sm">
                <div className=" flex items-center justify-end">
                  <img
                    src={logoImg}
                    alt={`${stake.id} logo`}
                    className=" w-[60%] "
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-row justify-between">
                  <div className="flex justify-between w-full items-center">
                    <span className="opacity-60">Staking Duration</span>
                    <div className="text-base  px-4 py-2 font-semibold bg-[#182b48] rounded-md normal-case">
                      {stake.stakeDay} days
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between  opacity-60 text-[16px]">
                  <span>Current APY:</span>
                  <span>{stake.currentApy} %</span>
                </div>

                <div className="flex flex-row justify-between  opacity-60 text-[16px]">
                  <span>Rewards Paid Weekly</span>
                  <span></span>
                </div>

                <div className="flex flex-row justify-between  opacity-60 text-[16px]">
                  <span>Deposit Amount</span>
                  <div className="flex flex-col">
                    <span className=" font-[800] text-right">
                      min:{" "}
                      {index === 0
                        ? 100
                        : index === 1
                        ? 1001
                        : index === 2
                        ? 2001
                        : ""}
                    </span>
                    <span className=" font-[800] text-right">
                      max:{" "}
                      {index === 0
                        ? 1000
                        : index === 1
                        ? 2000
                        : index === 2
                        ? 5000
                        : ""}
                    </span>
                  </div>
                </div>

                {/* <div className="flex flex-row justify-between  opacity-60 text-[16px]">
                  <span>Earn:</span>
                  <span>GuardAI</span>
                </div> */}

                <div className="flex flex-row justify-between  opacity-60 text-[16px]">
                  <span>GuardAI Staked</span>
                  <span className="text-[#ff4500]  font-[800]">
                    In Progress
                  </span>
                </div>

                <div className="my-8">
                  {stake.canClaim && parseFloat(stake.pendingAmount) > 0 ? (
                    <FilledButton
                      className="w-full text-base py-3 font-semibold bg-[#182b48]"
                      onClick={() => handleClaim(index, stake.pendingAmount)}
                    >
                      Claim
                    </FilledButton>
                  ) : !isConnected ? (
                    <FilledButton
                      className="w-full text-base py-3 font-semibold bg-[#182b48]"
                      onClick={open}
                    >
                      Connect Wallet
                    </FilledButton>
                  ) : isApproved ? (
                    <div>
                      <div className="flex flex-row items-center justify-center mb-4 gap-4">
                        <span>Amount: </span>
                        <input
                          className="w-full h-[40px] border-[1px] rounded-[2px] px-[10px] bg-[#182b48]"
                          onChange={(e: any) => {
                            setStakingAmount(e.target.value);
                          }}
                        />
                      </div>

                      <FilledButton
                        className="w-3/4 text-base py-3 font-semibold bg-[#182b48] float-right rounded-2xl"
                        onClick={() => {
                          setOption(index);
                          const stakingLimits = [
                            { min: 100, max: 1000 },
                            { min: 1001, max: 2000 },
                            { min: 2001, max: 5000 },
                          ];

                          if (index >= 0 && index < stakingLimits.length) {
                            const { min, max } = stakingLimits[index];

                            if (stakingAmount < min) {
                              toast.error(
                                `Staking amount must be at least ${min}.`
                              );
                            } else if (stakingAmount > max) {
                              toast.error(
                                `Staking amount must be less than ${max}.`
                              );
                            } else {
                              // onApprove();
                              setVisible(false);
                              setLoadingVisible(true);
                              stakingData.write && stakingData.write();
                            }
                          } else {
                            toast.error("Invalid option selected.");
                          }
                        }}
                      >
                        Stake Now
                      </FilledButton>
                    </div>
                  ) : (
                    <FilledButton
                      className="w-full text-base py-3 font-semibold bg-[#182b48]"
                      onClick={onApprove}
                    >
                      Enable Staking
                    </FilledButton>
                  )}
                </div>

                <div className="flex flex-row justify-between opacity-60 text-[16px]">
                  <span>You Staked:</span>
                  <span>{stake.youStaked} GuardAI</span>
                </div>

                <div className="flex flex-row justify-between opacity-60 text-[16px]">
                  <span>You Reward:</span>
                  <span>{stake.pendingAmount} GuardAI</span>
                </div>
                {/* 
                <div className="flex flex-row justify-between opacity-60 text-[16px]">
                  <span>Total Staked In Pool:</span>
                  <span className="font-[700] ">
                    {stake.totalStakedPool} GuardAI
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <CustomDialog
        title="Enter amount to Stake"
        visible={visible}
        setVisible={setVisible}
      >
        <input
          className="w-full h-[50px] border-[1px] rounded-[2px] px-[10px]"
          onChange={(e: any) => {
            setStakingAmount(e.target.value);
          }}
        />
        <div className="flex flex-row gap-5">
          <FilledButton
            onClick={() => {
              const stakingLimits = [
                { min: 100, max: 1000 },
                { min: 1001, max: 2000 },
                { min: 2001, max: 5000 },
              ];

              if (option >= 0 && option < stakingLimits.length) {
                const { min, max } = stakingLimits[option];

                if (stakingAmount < min) {
                  toast.error(`Staking amount must be at least ${min}.`);
                } else if (stakingAmount > max) {
                  toast.error(`Staking amount must be less than ${max}.`);
                } else {
                  setVisible(false);
                  setLoadingVisible(true);
                  stakingData.write && stakingData.write();
                }
              } else {
                toast.error("Invalid option selected.");
              }
            }}
            className="w-full text-base  font-semibold bg-[#182b48] mt-[5px]"
          >
            OK
          </FilledButton>
          <FilledButton
            onClick={() => {
              setVisible(false);
            }}
            className="w-full text-base  font-semibold bg-[#ddd] text-[000] mt-[5px]"
          >
            Cancel
          </FilledButton>
        </div>
      </CustomDialog> */}
      <LoadingDialog
        visible={stakingData.isLoading}
        setVisible={setLoadingVisible}
      ></LoadingDialog>
    </section>
  );
}
