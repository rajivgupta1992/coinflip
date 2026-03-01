"use client";

import { useRef, useEffect } from "react";

interface CustomTipInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: () => void;
  selected: boolean;
  wonAmount: number;
}

export default function CustomTipInput({
  value,
  onChange,
  onSelect,
  selected,
  wonAmount,
}: CustomTipInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected]);

  if (!selected) {
    return (
      <button
        onClick={onSelect}
        className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 border-gray-700 bg-[#1a1a1a] hover:border-gray-500 transition-all duration-150 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
      >
        <span className="text-xl font-bold text-gray-400">+</span>
        <span className="text-xs text-gray-600">Custom</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl border-2 border-green-500 bg-green-500/15">
      <div className="relative flex items-center">
        <span className="text-sm text-gray-500 mr-0.5">$</span>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 bg-transparent text-green-300 font-mono font-bold text-sm outline-none placeholder-gray-700 text-center"
          min="0.01"
          max={wonAmount}
          step="0.01"
        />
      </div>
      <span className="text-xs text-green-600">custom</span>
    </div>
  );
}
