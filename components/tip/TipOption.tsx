"use client";

interface TipOptionProps {
  label: string;
  dollarAmount: string;
  selected: boolean;
  onSelect: () => void;
}

export default function TipOption({ label, dollarAmount, selected, onSelect }: TipOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2
        transition-all duration-150 cursor-pointer
        hover:scale-[1.03] active:scale-[0.97]
        ${selected
          ? "border-green-500 bg-green-500/15 shadow-md shadow-green-500/20"
          : "border-gray-700 bg-[#1a1a1a] hover:border-gray-500"
        }
      `}
    >
      <span
        className={`text-base font-extrabold ${selected ? "text-green-400" : "text-gray-200"}`}
      >
        {label}
      </span>
      <span className="text-xs text-gray-500 font-mono">{dollarAmount}</span>
    </button>
  );
}
