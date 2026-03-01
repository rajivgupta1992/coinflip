"use client";

import { useEffect, useState } from "react";
import { Side } from "@/app/page";

interface ResultModalProps {
  won: boolean;
  amount: number;
  side: Side;
  result: Side;
  onPlayAgain: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  tx: string;
  ty: string;
  rot: string;
  color: string;
  size: number;
  borderRadius: string;
}

const CONFETTI_COLORS = [
  "#22c55e", "#16a34a", "#86efac",
  "#facc15", "#fbbf24", "#fde68a",
  "#38bdf8", "#60a5fa",
];

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    tx: `${(Math.random() - 0.5) * 200}px`,
    ty: `${80 + Math.random() * 120}px`,
    rot: `${(Math.random() - 0.5) * 720}deg`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

export default function ResultModal({ won, amount, side, result, onPlayAgain }: ResultModalProps) {
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [shakeClass, setShakeClass] = useState("");

  useEffect(() => {
    if (won) {
      setConfetti(generateConfetti());
    } else {
      setShakeClass("loss-shake");
      setTimeout(() => setShakeClass(""), 600);
    }
  }, [won]);

  const isHeads = result === "heads";

  return (
    <div className={`relative flex flex-col items-center justify-center gap-6 py-8 w-full slide-up-fade-in ${shakeClass}`}>
      {/* Confetti */}
      {won && confetti.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="absolute confetti-particle"
              style={{
                left: `${p.x}%`,
                top: "10%",
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: p.borderRadius,
                // @ts-expect-error CSS custom properties
                "--tx": p.tx,
                "--ty": p.ty,
                "--rot": p.rot,
              }}
            />
          ))}
        </div>
      )}

      {/* Result coin */}
      <div className="coin-perspective">
        <div
          className={`
            w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-2xl
            ${won ? "win-glow" : ""}
            ${isHeads
              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300"
              : "bg-gradient-to-br from-blue-400 to-blue-700 border-blue-300"
            }
          `}
        >
          <span className={`text-5xl font-bold ${isHeads ? "text-yellow-900" : "text-blue-100"}`}>
            {isHeads ? "$" : "⬡"}
          </span>
        </div>
      </div>

      {/* Result text */}
      <div className="text-center space-y-2">
        {won ? (
          <>
            <p className="text-4xl font-extrabold text-green-400">You won!</p>
            <p className="text-2xl font-bold text-white">
              +${amount.toFixed(2)}{" "}
              <span className="text-gray-400 text-lg font-normal">USDC</span>
            </p>
            <p className="text-sm text-gray-500">
              Landed on{" "}
              <span
                className={`font-bold uppercase ${
                  isHeads ? "text-yellow-400" : "text-blue-400"
                }`}
              >
                {result}
              </span>
              {" "}· Tip screen loading...
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-extrabold text-gray-400">Not this time.</p>
            <p className="text-xl font-bold text-red-400">
              −${amount.toFixed(2)}{" "}
              <span className="text-gray-500 text-base font-normal">USDC</span>
            </p>
            <p className="text-sm text-gray-600">
              Landed on{" "}
              <span
                className={`font-bold uppercase ${
                  isHeads ? "text-yellow-400" : "text-blue-400"
                }`}
              >
                {result}
              </span>
              {" "}· You picked{" "}
              <span className="font-bold uppercase text-gray-400">{side}</span>
            </p>
          </>
        )}
      </div>

      {/* Play again (loss only) */}
      {!won && (
        <button
          onClick={onPlayAgain}
          className="mt-2 bg-[#1a1a1a] hover:bg-[#242424] border border-gray-700 hover:border-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
