"use client";


interface BetAmountInputProps {
  value: string;
  onChange: (val: string) => void;
  balance: number;
  maxBet: number;
  disabled?: boolean;
}

const QUICK_PCTS = [
  { label: "25%", pct: 0.25 },
  { label: "50%", pct: 0.5 },
  { label: "75%", pct: 0.75 },
  { label: "MAX", pct: 1 },
];

export default function BetAmountInput({
  value,
  onChange,
  balance,
  maxBet,
  disabled,
}: BetAmountInputProps) {
  const numVal = parseFloat(value) || 0;
  const effectiveMax = Math.min(balance, maxBet);
  const tooLow = numVal > 0 && numVal < 1;
  const tooHigh = numVal > effectiveMax;
  const empty = value === "" || value === "0";

  function handleQuick(pct: number) {
    if (disabled) return;
    const amt = Math.min(effectiveMax * pct, effectiveMax);
    onChange(amt.toFixed(2));
  }

  return (
    <div className="space-y-3 w-full">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium">Bet Amount</span>
        <span className="text-gray-500 font-mono">
          Max: <span className="text-gray-300">${effectiveMax.toFixed(2)}</span>
        </span>
      </div>

      {/* Input */}
      <div
        className={`
          relative flex items-center bg-[#111] border rounded-xl overflow-hidden
          transition-all duration-150
          ${tooLow || tooHigh
            ? "border-red-500 shadow-sm shadow-red-500/20"
            : "border-gray-700 focus-within:border-green-500 focus-within:shadow-sm focus-within:shadow-green-500/20"
          }
        `}
      >
        <span className="pl-4 text-gray-500 text-lg font-bold select-none">$</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 bg-transparent text-white text-xl font-mono font-bold py-3 px-2 outline-none placeholder-gray-700 disabled:opacity-50"
          min="1"
          max={effectiveMax}
          step="0.01"
        />
        <span className="pr-4 text-gray-500 text-sm font-medium select-none">USDC</span>
      </div>

      {/* Error messages */}
      {tooLow && (
        <p className="text-xs text-red-400 font-medium">Minimum bet is $1.00</p>
      )}
      {tooHigh && (
        <p className="text-xs text-red-400 font-medium">
          Max bet is ${effectiveMax.toFixed(2)} (5% of pool, capped to your balance)
        </p>
      )}

      {/* Quick % buttons */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_PCTS.map(({ label, pct }) => (
          <button
            key={label}
            onClick={() => handleQuick(pct)}
            disabled={disabled}
            className="
              py-2 rounded-lg text-xs font-bold text-gray-300
              bg-[#1a1a1a] border border-gray-700
              hover:bg-[#242424] hover:border-gray-500 hover:text-white
              active:bg-[#2a2a2a]
              transition-all duration-100
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {label}
          </button>
        ))}
      </div>

      {/* Balance display */}
      <div className="text-xs text-gray-600 font-mono text-right">
        Wallet: ${balance.toFixed(2)} USDC
      </div>
    </div>
  );
}
