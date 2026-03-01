"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Header from "@/components/layout/Header";
import PoolStatsBar from "@/components/layout/PoolStatsBar";
import CoinFlipCard from "@/components/game/CoinFlipCard";
import TipScreen from "@/components/tip/TipScreen";
import RecentFlips from "@/components/feed/RecentFlips";
import LandingHero from "@/components/layout/LandingHero";
import { useCoinFlipStats, useWriteFlip, useWriteTip, useWatchBetSettled, useWatchAllBetSettled } from "@/hooks/useCoinFlip";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Side = "heads" | "tails";

export type GameState =
  | { phase: "idle" }
  | { phase: "approving" }
  | { phase: "placing"; side: Side; amount: number }
  | { phase: "pending_vrf"; side: Side; amount: number; requestId: string }
  | { phase: "result"; won: boolean; amount: number; side: Side; result: Side }
  | { phase: "tipping"; wonAmount: number };

export interface FlipRecord {
  id: string;
  address: string;
  amount: number;
  side: Side;
  won: boolean;
  timestamp: number;
}

export interface PoolState {
  size: number;
  totalFlips: number;
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function Home() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [gameState, setGameState] = useState<GameState>({ phase: "idle" });
  const [recentFlips, setRecentFlips] = useState<FlipRecord[]>([]);

  // ── On-chain data ─────────────────────────────────────────────────────────
  const { poolSize, maxBet, totalFlips, refetch: refetchStats } = useCoinFlipStats();
  const { formatted: usdcBalance, refetch: refetchBalance } = useUsdcBalance(address);

  const pool: PoolState = { size: poolSize, totalFlips };

  // ── Tx writers ────────────────────────────────────────────────────────────
  const { writeFlip } = useWriteFlip(setGameState);
  const { writeTip }  = useWriteTip(setGameState);

  // ── Watch for VRF settlement of the current pending bet ───────────────────
  const pendingRequestId =
    gameState.phase === "pending_vrf" ? gameState.requestId : null;

  useWatchBetSettled(pendingRequestId, (won, result) => {
    if (gameState.phase !== "pending_vrf") return;
    const { side, amount } = gameState;

    // Add to feed
    setRecentFlips((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        address: address ?? "0x????",
        amount,
        side,
        won,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 10));

    setGameState({ phase: "result", won, amount, side, result });

    if (won) {
      setTimeout(() => {
        setGameState({ phase: "tipping", wonAmount: amount });
      }, 2_000);
    }

    refetchStats();
    refetchBalance();
  });

  // ── Watch all BetSettled events for the live feed ─────────────────────────
  useWatchAllBetSettled((args) => {
    const side: Side = args.isHeads ? "heads" : "tails";
    setRecentFlips((prev) => [
      {
        id: args.requestId.toString(16).slice(-8),
        address: args.player.slice(0, 6) + "..." + args.player.slice(-4),
        amount: Number(args.amount) / 1e6,
        side,
        won: args.won,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 10));
    refetchStats();
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConnect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const handleFlip = useCallback(
    async (side: Side, amount: number) => {
      try {
        await writeFlip(side, amount);
      } catch (err) {
        console.error("Flip failed:", err);
        setGameState({ phase: "idle" });
      }
    },
    [writeFlip]
  );

  const handleTip = useCallback(
    async (tipAmount: number | null) => {
      if (tipAmount && tipAmount > 0) {
        try {
          await writeTip(tipAmount);
        } catch (err) {
          console.error("Tip failed:", err);
          setGameState({ phase: "idle" });
        }
      } else {
        setGameState({ phase: "idle" });
      }
    },
    [writeTip]
  );

  const handlePlayAgain = useCallback(() => {
    setGameState({ phase: "idle" });
  }, []);

  const isTipping = gameState.phase === "tipping";

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <Header
        connected={isConnected}
        wallet={address ?? ""}
        balance={usdcBalance}
        pool={pool}
        maxBet={maxBet}
      />

      <PoolStatsBar pool={pool} maxBet={maxBet} />

      <main className="flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex-1 flex flex-col items-center">
          {!isConnected ? (
            <LandingHero onConnect={handleConnect} />
          ) : (
            <CoinFlipCard
              gameState={gameState}
              balance={usdcBalance}
              maxBet={maxBet}
              onFlip={handleFlip}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </div>

        <div className="w-full lg:w-80 xl:w-96">
          <RecentFlips flips={recentFlips} />
        </div>
      </main>

      {isTipping && gameState.phase === "tipping" && (
        <TipScreen wonAmount={gameState.wonAmount} onTip={handleTip} />
      )}
    </div>
  );
}
