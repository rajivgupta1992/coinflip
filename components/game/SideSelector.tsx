"use client";

import { Side } from "@/app/page";

interface SideSelectorProps {
  selected: Side | null;
  onSelect: (side: Side) => void;
  disabled?: boolean;
}

export default function SideSelector({ selected, onSelect, disabled }: SideSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <SideCard
        side="heads"
        label="HEADS"
        emoji="$"
        description="Golden Dollar"
        selected={selected === "heads"}
        onSelect={onSelect}
        disabled={disabled}
      />
      <SideCard
        side="tails"
        label="TAILS"
        emoji="⬡"
        description="Shield"
        selected={selected === "tails"}
        onSelect={onSelect}
        disabled={disabled}
      />
    </div>
  );
}

interface SideCardProps {
  side: Side;
  label: string;
  emoji: string;
  description: string;
  selected: boolean;
  onSelect: (side: Side) => void;
  disabled?: boolean;
}

function SideCard({ side, label, emoji, description, selected, onSelect, disabled }: SideCardProps) {
  const isHeads = side === "heads";

  return (
    <button
      onClick={() => !disabled && onSelect(side)}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2
        transition-all duration-150 cursor-pointer select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}
        ${selected
          ? isHeads
            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
            : "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
          : "border-gray-700 bg-[#1a1a1a] hover:border-gray-500"
        }
      `}
    >
      {/* Coin face */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
          transition-all duration-200
          ${isHeads
            ? selected
              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30 border-2 border-yellow-300"
              : "bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500"
            : selected
              ? "bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-500/30 border-2 border-blue-300"
              : "bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500"
          }
        `}
      >
        <span className={isHeads ? "text-yellow-900" : "text-blue-100"}>
          {emoji}
        </span>
      </div>

      {/* Label */}
      <span
        className={`
          text-sm font-extrabold tracking-widest uppercase
          ${selected
            ? isHeads ? "text-green-400" : "text-blue-400"
            : "text-gray-400"
          }
        `}
      >
        {label}
      </span>

      <span className="text-xs text-gray-600">{description}</span>

      {/* Selected checkmark */}
      {selected && (
        <div
          className={`
            absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs
            ${isHeads ? "bg-green-500" : "bg-blue-500"}
          `}
        >
          ✓
        </div>
      )}
    </button>
  );
}
