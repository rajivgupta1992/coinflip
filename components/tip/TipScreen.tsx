"use client";

import { useState } from "react";
import TipOption from "./TipOption";
import CustomTipInput from "./CustomTipInput";

interface TipScreenProps {
  wonAmount: number;
  onTip: (tipAmount: number | null) => void;
}

type TipSelection = "5" | "10" | "15" | "custom" | null;

const TIP_OPTIONS: { key: TipSelection; label: string; pct: number }[] = [
  { key: "5", label: "5%", pct: 0.05 },
  { key: "10", label: "10%", pct: 0.1 },
  { key: "15", label: "15%", pct: 0.15 },
];

export default function TipScreen({ wonAmount, onTip }: TipScreenProps) {
  const [selected, setSelected] = useState<TipSelection>("10");
  const [customValue, setCustomValue] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  function getTipAmount(): number {
    if (selected === null) return 0;
    if (selected === "custom") {
      return parseFloat(customValue) || 0;
    }
    const opt = TIP_OPTIONS.find((o) => o.key === selected);
    return opt ? wonAmount * opt.pct : 0;
  }

  const tipAmount = getTipAmount();
  const toPool = tipAmount * 0.5;
  const toHouse = tipAmount * 0.5;
  const tipLabel = selected === "custom"
    ? customValue
      ? `$${parseFloat(customValue).toFixed(2)}`
      : "$0.00"
    : selected
    ? `$${tipAmount.toFixed(2)}`
    : "$0.00";

  function handleConfirm() {
    if (tipAmount > 0) {
      setConfirmed(true);
      setTimeout(() => {
        onTip(tipAmount);
      }, 2_500);
    } else {
      onTip(null);
    }
  }

  function handleSkip() {
    onTip(null);
  }

  // ── Post-tip confirmation screen ─────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 w-full max-w-md text-center slide-up-fade-in shadow-2xl">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-white mb-2">Thanks!</h2>
          <p className="text-gray-400 text-sm mb-6">
            <span className="text-green-400 font-bold font-mono">
              ${toPool.toFixed(2)} USDC
            </span>{" "}
            went to the pool ·{" "}
            <span className="text-gray-300 font-bold font-mono">
              ${toHouse.toFixed(2)} USDC
            </span>{" "}
            to the house
          </p>
          <p className="text-xs text-gray-600">Returning to game...</p>
        </div>
      </div>
    );
  }

  // ── Main tip screen ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl slide-up-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-extrabold text-green-400">
            You won ${wonAmount.toFixed(2)} USDC!
          </h2>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            The house earns{" "}
            <span className="text-white font-bold">zero</span> on the flip.
            Tips keep this running.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            50% of your tip grows the pool.
          </p>
        </div>

        {/* Tip options */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {TIP_OPTIONS.map((opt) => (
            <TipOption
              key={opt.key}
              label={opt.label}
              dollarAmount={`$${(wonAmount * opt.pct).toFixed(2)}`}
              selected={selected === opt.key}
              onSelect={() => {
                setSelected(opt.key);
                setCustomValue("");
              }}
            />
          ))}
          <CustomTipInput
            value={customValue}
            onChange={setCustomValue}
            onSelect={() => setSelected("custom")}
            selected={selected === "custom"}
            wonAmount={wonAmount}
          />
        </div>

        {/* Pool split info */}
        {tipAmount > 0 && (
          <div className="bg-[#111] rounded-xl px-4 py-3 mb-5 flex items-center justify-between text-xs border border-gray-800">
            <span className="text-gray-500">→ Pool</span>
            <span className="text-green-400 font-mono font-bold">${toPool.toFixed(2)}</span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-500">→ House</span>
            <span className="text-gray-300 font-mono font-bold">${toHouse.toFixed(2)}</span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleConfirm}
          className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-black font-extrabold text-base py-4 rounded-xl transition-all duration-150 shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] mb-3"
        >
          {tipAmount > 0
            ? `Tip ${tipLabel} USDC →`
            : "Continue without tip →"}
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="w-full text-sm text-gray-600 hover:text-gray-400 py-2 transition-colors duration-150"
        >
          Skip (no tip)
        </button>
      </div>
    </div>
  );
}
