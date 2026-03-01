"use client";

import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWatchContractEvent,
  usePublicClient,
} from "wagmi";
import { parseUnits, parseEventLogs } from "viem";
import { COINFLIP_ADDRESS, USDC_ADDRESS, COINFLIP_ABI, ERC20_ABI } from "@/lib/contracts";
import type { GameState, Side } from "@/app/page";

// ── Pool stats (read-only) ──────────────────────────────────────────────────

export function useCoinFlipStats() {
  const { data: poolSizeRaw, refetch: refetchPool } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "poolSize",
  });

  const { data: maxBetRaw, refetch: refetchMax } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "maxBet",
  });

  const { data: totalFlipsRaw, refetch: refetchFlips } = useReadContract({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    functionName: "totalFlips",
  });

  return {
    poolSize:   Number(poolSizeRaw ?? 0n) / 1e6,
    maxBet:     Number(maxBetRaw   ?? 0n) / 1e6,
    totalFlips: Number(totalFlipsRaw ?? 0n),
    refetch: () => { refetchPool(); refetchMax(); refetchFlips(); },
  };
}

// ── Write: flip (approve → flip) ────────────────────────────────────────────

export function useWriteFlip(setGameState: (gs: GameState) => void) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const writeFlip = useCallback(
    async (side: Side, amount: number) => {
      const amountUnits = parseUnits(amount.toString(), 6);

      // ── Phase: approving ────────────────────────────────────────────────
      setGameState({ phase: "approving" });
      const approveTxHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [COINFLIP_ADDRESS, amountUnits],
      });
      await publicClient!.waitForTransactionReceipt({ hash: approveTxHash });

      // ── Phase: placing ──────────────────────────────────────────────────
      setGameState({ phase: "placing", side, amount });
      const flipTxHash = await writeContractAsync({
        address: COINFLIP_ADDRESS,
        abi: COINFLIP_ABI,
        functionName: "flip",
        args: [side === "heads", amountUnits],
      });
      const receipt = await publicClient!.waitForTransactionReceipt({ hash: flipTxHash });

      // Parse requestId from BetPlaced event log
      let requestId = flipTxHash.slice(0, 6) + "..." + flipTxHash.slice(-4);
      try {
        const parsed = parseEventLogs({
          abi: COINFLIP_ABI,
          eventName: "BetPlaced",
          logs: receipt.logs,
        });
        if (parsed.length > 0) {
          const rId = (parsed[0].args as { requestId: bigint }).requestId;
          const hex = rId.toString(16).padStart(8, "0");
          requestId = "0x" + hex.slice(0, 4) + "..." + hex.slice(-4);
        }
      } catch {
        // fall back to tx hash snippet
      }

      // ── Phase: pending_vrf ──────────────────────────────────────────────
      setGameState({ phase: "pending_vrf", side, amount, requestId });
    },
    [writeContractAsync, publicClient, setGameState]
  );

  return { writeFlip };
}

// ── Write: tip (approve → tip) ───────────────────────────────────────────────

export function useWriteTip(setGameState: (gs: GameState) => void) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const writeTip = useCallback(
    async (amount: number) => {
      const amountUnits = parseUnits(amount.toString(), 6);

      const approveTxHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [COINFLIP_ADDRESS, amountUnits],
      });
      await publicClient!.waitForTransactionReceipt({ hash: approveTxHash });

      const tipTxHash = await writeContractAsync({
        address: COINFLIP_ADDRESS,
        abi: COINFLIP_ABI,
        functionName: "tip",
        args: [amountUnits],
      });
      await publicClient!.waitForTransactionReceipt({ hash: tipTxHash });

      setGameState({ phase: "idle" });
    },
    [writeContractAsync, publicClient, setGameState]
  );

  return { writeTip };
}

// ── Watch: BetSettled (scoped to a requestId) ────────────────────────────────

export function useWatchBetSettled(
  pendingRequestId: string | null,
  onSettled: (won: boolean, result: Side) => void
) {
  useWatchContractEvent({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    eventName: "BetSettled",
    onLogs(logs) {
      for (const log of logs) {
        const args = log.args as {
          player: `0x${string}`;
          isHeads: boolean;
          won: boolean;
          amount: bigint;
          requestId: bigint;
        };

        if (!pendingRequestId) continue;

        // Match the display requestId (e.g. "0x0012...ab34") against the log
        const hex = args.requestId?.toString(16).padStart(8, "0") ?? "";
        const displayId = "0x" + hex.slice(0, 4) + "..." + hex.slice(-4);

        if (displayId === pendingRequestId) {
          const result: Side = args.isHeads ? "heads" : "tails";
          onSettled(args.won, result);
        }
      }
    },
    enabled: !!pendingRequestId,
  });
}

// ── Watch: all BetSettled events (for recent flips feed) ────────────────────

export function useWatchAllBetSettled(
  onSettled: (args: {
    player: `0x${string}`;
    isHeads: boolean;
    won: boolean;
    amount: bigint;
    requestId: bigint;
  }) => void
) {
  useWatchContractEvent({
    address: COINFLIP_ADDRESS,
    abi: COINFLIP_ABI,
    eventName: "BetSettled",
    onLogs(logs) {
      for (const log of logs) {
        onSettled(
          log.args as {
            player: `0x${string}`;
            isHeads: boolean;
            won: boolean;
            amount: bigint;
            requestId: bigint;
          }
        );
      }
    },
  });
}
