"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract, usePublicClient } from "wagmi";
import { USDC_ADDRESS, ERC20_ABI, AMOY_CHAIN_ID } from "@/lib/contracts";

const FAUCET_AMOUNT = BigInt(100 * 1e6); // 100 USDC

interface FaucetButtonProps {
  onSuccess: () => void;
}

export default function FaucetButton({ onSuccess }: FaucetButtonProps) {
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  // Only show on Amoy testnet
  if (chainId !== AMOY_CHAIN_ID || !address) return null;

  async function handleFaucet() {
    if (!address || status === "pending") return;
    setStatus("pending");
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "faucet",
        args: [address, FAUCET_AMOUNT],
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      setStatus("done");
      onSuccess();
      // Reset label after 3s
      setTimeout(() => setStatus("idle"), 3_000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3_000);
    }
  }

  const label =
    status === "pending" ? "Getting USDC…" :
    status === "done"    ? "✓ Got 100 USDC" :
    status === "error"   ? "Failed — retry" :
                           "Get 100 test USDC";

  return (
    <button
      onClick={handleFaucet}
      disabled={status === "pending"}
      className={`
        w-full py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
        ${status === "done"
          ? "border-green-600 text-green-400 bg-green-500/10"
          : status === "error"
          ? "border-red-700 text-red-400 bg-red-500/10"
          : status === "pending"
          ? "border-gray-700 text-gray-500 bg-gray-800/50 cursor-not-allowed"
          : "border-gray-700 text-gray-400 bg-transparent hover:border-gray-500 hover:text-gray-200 cursor-pointer"
        }
      `}
    >
      {label}
    </button>
  );
}
