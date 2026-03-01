"use client";

import { useEffect, useState } from "react";
import { Side } from "@/app/page";

interface PendingBetProps {
  phase: "approving" | "placing" | "pending_vrf";
  side?: Side;
  amount?: number;
  requestId?: string;
}

export default function PendingBet({ phase, side, amount, requestId }: PendingBetProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== "pending_vrf") {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const title =
    phase === "approving"
      ? "Approving USDC..."
      : phase === "placing"
      ? "Placing bet..."
      : "Waiting for randomness...";

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 w-full slide-up-fade-in">
      {/* Animated coin */}
      <div className="coin-perspective">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-yellow-300 coin-spinning">
          <span className="text-5xl font-bold text-yellow-900 select-none">$</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">{title}</h2>

        {phase === "pending_vrf" && (
          <>
            <p className="text-sm text-gray-400">
              Chainlink VRF randomness requested on Polygon
            </p>
            {requestId && (
              <p className="text-xs font-mono text-gray-600 mt-1">
                Request ID: <span className="text-gray-400">{requestId}</span>
              </p>
            )}

            {/* Elapsed */}
            <p className="text-xs text-gray-600 mt-2">
              {elapsed}s elapsed
            </p>
          </>
        )}
      </div>

      {/* Pulse dots */}
      <div className="flex gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 dot-1" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 dot-2" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 dot-3" />
      </div>

      {/* Bet summary */}
      {side && amount && (
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-[#1a1a1a] rounded-xl px-5 py-3 border border-gray-800">
          <span className="font-mono font-bold text-gray-200">${amount.toFixed(2)}</span>
          <span className="text-gray-600">on</span>
          <span
            className={`uppercase font-bold tracking-widest ${
              side === "heads" ? "text-yellow-400" : "text-blue-400"
            }`}
          >
            {side}
          </span>
        </div>
      )}
    </div>
  );
}
