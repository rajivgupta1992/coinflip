"use client";

import { useState } from "react";
import { GameState, Side } from "@/app/page";
import SideSelector from "./SideSelector";
import BetAmountInput from "./BetAmountInput";
import PendingBet from "./PendingBet";
import ResultModal from "./ResultModal";
import FaucetButton from "./FaucetButton";

interface CoinFlipCardProps {
  gameState: GameState;
  balance: number;
  maxBet: number;
  onFlip: (side: Side, amount: number) => void;
  onPlayAgain: () => void;
  onFaucet: () => void;
}

export default function CoinFlipCard({
  gameState,
  balance,
  maxBet,
  onFlip,
  onPlayAgain,
  onFaucet,
}: CoinFlipCardProps) {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [betInput, setBetInput] = useState<string>("");

  const isActive = gameState.phase === "idle";
  const isBusy =
    gameState.phase === "approving" ||
    gameState.phase === "placing" ||
    gameState.phase === "pending_vrf";

  const numBet = parseFloat(betInput) || 0;
  const effectiveMax = Math.min(balance, maxBet);
  const canFlip =
    isActive &&
    selectedSide !== null &&
    numBet >= 1 &&
    numBet <= effectiveMax;

  function handleFlip() {
    if (!canFlip || !selectedSide) return;
    onFlip(selectedSide, numBet);
  }

  return (
    <div className="w-full max-w-md">
      <div
        className={`
          relative bg-[#141414] border border-gray-800 rounded-2xl p-6 shadow-2xl
          transition-all duration-300
          ${isBusy ? "border-gray-700" : ""}
        `}
      >
        {/* Card header */}
        <div className="mb-5 pb-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Coin Flip</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            50/50 · No house edge · Chainlink VRF
          </p>
        </div>

        {/* ── IDLE: Betting form ─────────────────────────────────────────────── */}
        {gameState.phase === "idle" && (
          <div className="space-y-5 slide-up-fade-in">
            <SideSelector
              selected={selectedSide}
              onSelect={setSelectedSide}
            />
            <BetAmountInput
              value={betInput}
              onChange={setBetInput}
              balance={balance}
              maxBet={maxBet}
            />

            <button
              onClick={handleFlip}
              disabled={!canFlip}
              className={`
                w-full py-4 rounded-xl font-extrabold text-lg tracking-wide transition-all duration-150
                ${canFlip
                  ? "bg-green-500 hover:bg-green-400 active:bg-green-600 text-black shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
                }
              `}
            >
              {!selectedSide
                ? "Choose a side"
                : betInput === "" || numBet === 0
                ? "Enter an amount"
                : !canFlip
                ? "Invalid bet"
                : "Flip →"}
            </button>

            <FaucetButton onSuccess={onFaucet} />
          </div>
        )}

        {/* ── APPROVING / PLACING / PENDING VRF ─────────────────────────────── */}
        {(gameState.phase === "approving" ||
          gameState.phase === "placing" ||
          gameState.phase === "pending_vrf") && (
          <PendingBet
            phase={gameState.phase}
            side={"side" in gameState ? gameState.side : undefined}
            amount={"amount" in gameState ? gameState.amount : undefined}
            requestId={"requestId" in gameState ? gameState.requestId : undefined}
          />
        )}

        {/* ── RESULT ─────────────────────────────────────────────────────────── */}
        {gameState.phase === "result" && (
          <ResultModal
            won={gameState.won}
            amount={gameState.amount}
            side={gameState.side}
            result={gameState.result}
            onPlayAgain={onPlayAgain}
          />
        )}

        {/* ── TIPPING (transitional — TipScreen renders as overlay) ──────────── */}
        {gameState.phase === "tipping" && (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
            Loading tip screen...
          </div>
        )}
      </div>
    </div>
  );
}
