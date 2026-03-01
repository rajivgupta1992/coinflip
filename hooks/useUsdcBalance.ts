"use client";

import { useReadContract } from "wagmi";
import { USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts";

export function useUsdcBalance(address: `0x${string}` | undefined) {
  const { data, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // USDC has 6 decimals → display value
  const raw = data ?? BigInt(0);
  const formatted = Number(raw) / 1e6;

  return { raw, formatted, refetch };
}
