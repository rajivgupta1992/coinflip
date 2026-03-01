"use client";

import { FlipRecord, Side } from "@/app/page";

interface RecentFlipsProps {
  flips: FlipRecord[];
}

function timeAgo(ts: number): string {
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 5) return "just now";
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  return `${Math.floor(delta / 3600)}h ago`;
}

export default function RecentFlips({ flips }: RecentFlipsProps) {
  return (
    <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-200">Recent Flips</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-600">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div className="overflow-y-auto max-h-[420px] feed-scroll">
        {flips.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-600">
            No flips yet
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {flips.map((flip, i) => (
              <FlipRow key={flip.id} flip={flip} isNew={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FlipRow({ flip, isNew }: { flip: FlipRecord; isNew: boolean }) {
  return (
    <div
      className={`
        px-4 py-3 flex items-center gap-3 text-xs transition-colors duration-300
        ${isNew ? "bg-green-500/5 slide-up-fade-in" : "hover:bg-[#1a1a1a]"}
      `}
    >
      {/* Win/loss indicator */}
      <div
        className={`
          flex-shrink-0 w-1.5 h-8 rounded-full
          ${flip.won ? "bg-green-500" : "bg-gray-700"}
        `}
      />

      {/* Address */}
      <span className="font-mono text-gray-400 w-28 flex-shrink-0 truncate">
        {flip.address}
      </span>

      {/* Amount + side */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-mono font-bold text-gray-200">
          ${flip.amount.toFixed(0)}
        </span>
        <span
          className={`uppercase tracking-widest font-bold text-[10px] ${
            flip.side === "heads" ? "text-yellow-500" : "text-blue-500"
          }`}
        >
          {flip.side}
        </span>
      </div>

      {/* Result */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span
          className={`font-bold text-xs ${
            flip.won ? "text-green-400" : "text-red-400"
          }`}
        >
          {flip.won ? "WIN" : "LOSS"}
        </span>
        <span className="text-gray-700 text-[10px]">{timeAgo(flip.timestamp)}</span>
      </div>
    </div>
  );
}
