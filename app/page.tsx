"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import PoolStatsBar from "@/components/layout/PoolStatsBar";
import CoinFlipCard from "@/components/game/CoinFlipCard";
import TipScreen from "@/components/tip/TipScreen";
import RecentFlips from "@/components/feed/RecentFlips";
import LandingHero from "@/components/layout/LandingHero";

// ─── Mock Constants ────────────────────────────────────────────────────────────
export const INITIAL_POOL = 4_823.5;
export const MOCK_WALLET = "0x71C7...3e4F";
export const MOCK_BALANCE_INITIAL = 500.0;

// ─── Types ─────────────────────────────────────────────────────────────────────
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

// ─── Mock Recent Flips Seed ────────────────────────────────────────────────────
const MOCK_ADDRESSES = [
  "0xA3b2...9f1E",
  "0xF49c...2d8B",
  "0x8e1D...7a3C",
  "0x2cF8...b5E1",
  "0x99aB...4f2D",
  "0x5d3E...c9A0",
];

function randomAddress() {
  return MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)];
}

function randomFlip(): FlipRecord {
  const won = Math.random() > 0.5;
  const side: Side = Math.random() > 0.5 ? "heads" : "tails";
  const amounts = [5, 10, 20, 25, 50, 100];
  return {
    id: Math.random().toString(36).slice(2),
    address: randomAddress(),
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    side,
    won,
    timestamp: Date.now() - Math.floor(Math.random() * 60_000),
  };
}

function seedFlips(): FlipRecord[] {
  return Array.from({ length: 8 }, (_, i) => ({
    ...randomFlip(),
    timestamp: Date.now() - (i + 1) * 7_000,
  }));
}

// ─── Root Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({ phase: "idle" });
  const [pool, setPool] = useState<PoolState>({
    size: INITIAL_POOL,
    totalFlips: 1_247,
  });
  const [balance, setBalance] = useState(MOCK_BALANCE_INITIAL);
  const [recentFlips, setRecentFlips] = useState<FlipRecord[]>(seedFlips);

  // Max bet = 5% of pool
  const maxBet = pool.size * 0.05;

  // ─── Add a flip to the feed ─────────────────────────────────────────────────
  const addFlip = useCallback((flip: FlipRecord) => {
    setRecentFlips((prev) => [flip, ...prev].slice(0, 10));
  }, []);

  // ─── Auto-generate background activity ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const flip = randomFlip();
      addFlip(flip);
      setPool((prev) => ({
        size: flip.won
          ? prev.size - flip.amount
          : prev.size + flip.amount * 0.95,
        totalFlips: prev.totalFlips + 1,
      }));
    }, 8_000 + Math.random() * 6_000);
    return () => clearInterval(interval);
  }, [addFlip]);

  // ─── Handle Wallet Connect ──────────────────────────────────────────────────
  const handleConnect = useCallback(() => {
    setConnected(true);
  }, []);

  // ─── Handle Flip Submission ─────────────────────────────────────────────────
  const handleFlip = useCallback(
    (side: Side, amount: number) => {
      // State 2: Approving
      setGameState({ phase: "approving" });

      setTimeout(() => {
        // State 3: Placing
        setGameState({ phase: "placing", side, amount });

        setTimeout(() => {
          // State 4: Pending VRF
          const requestId =
            "0x" +
            Math.random().toString(16).slice(2, 6) +
            "..." +
            Math.random().toString(16).slice(2, 6);
          setGameState({ phase: "pending_vrf", side, amount, requestId });

          // 3–5 second VRF wait
          const vrfDelay = 3_000 + Math.random() * 2_000;
          setTimeout(() => {
            const result: Side = Math.random() > 0.5 ? "heads" : "tails";
            const won = result === side;

            // Update pool
            setPool((prev) => ({
              size: won
                ? prev.size - amount
                : prev.size + amount * 0.95,
              totalFlips: prev.totalFlips + 1,
            }));

            // Update player balance
            setBalance((prev) => (won ? prev + amount : prev - amount));

            // Add to feed
            addFlip({
              id: Math.random().toString(36).slice(2),
              address: MOCK_WALLET,
              amount,
              side,
              won,
              timestamp: Date.now(),
            });

            // State 5: Result
            setGameState({ phase: "result", won, amount, side, result });

            if (won) {
              // Auto-advance to tip screen after 2s
              setTimeout(() => {
                setGameState({ phase: "tipping", wonAmount: amount });
              }, 2_000);
            }
          }, vrfDelay);
        }, 1_000);
      }, 1_000);
    },
    [addFlip]
  );

  // ─── Handle Tip ─────────────────────────────────────────────────────────────
  const handleTip = useCallback(
    (tipAmount: number | null) => {
      if (tipAmount && tipAmount > 0) {
        const toPool = tipAmount * 0.5;
        setPool((prev) => ({ ...prev, size: prev.size + toPool }));
        setBalance((prev) => prev - tipAmount);
      }
      setGameState({ phase: "idle" });
    },
    []
  );

  // ─── Handle Play Again ───────────────────────────────────────────────────────
  const handlePlayAgain = useCallback(() => {
    setGameState({ phase: "idle" });
  }, []);

  // ─── Tip Screen State ────────────────────────────────────────────────────────
  const isTipping = gameState.phase === "tipping";

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Header — always visible when connected */}
      <Header
        connected={connected}
        wallet={MOCK_WALLET}
        balance={balance}
        pool={pool}
        maxBet={maxBet}
      />

      {/* Pool stats bar — always visible */}
      <PoolStatsBar pool={pool} maxBet={maxBet} />

      <main className="flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Left column: Game area */}
        <div className="flex-1 flex flex-col items-center">
          {!connected ? (
            <LandingHero onConnect={handleConnect} />
          ) : (
            <CoinFlipCard
              gameState={gameState}
              balance={balance}
              maxBet={maxBet}
              onFlip={handleFlip}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </div>

        {/* Right column: Recent flips feed */}
        <div className="w-full lg:w-80 xl:w-96">
          <RecentFlips flips={recentFlips} />
        </div>
      </main>

      {/* Tip screen overlay — rendered on top of everything */}
      {isTipping && gameState.phase === "tipping" && (
        <TipScreen wonAmount={gameState.wonAmount} onTip={handleTip} />
      )}
    </div>
  );
}
