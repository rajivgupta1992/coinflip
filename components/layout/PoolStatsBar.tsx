"use client";

import { PoolState } from "@/app/page";

// Reference size for pool-health bar (10,000 USDC matches the deploy seed)
const REFERENCE_POOL = 10_000;

interface PoolStatsBarProps {
  pool: PoolState;
  maxBet: number;
}

export default function PoolStatsBar({ pool, maxBet }: PoolStatsBarProps) {
  const healthPct = Math.max(0, Math.min(100, (pool.size / REFERENCE_POOL) * 100));
  const healthColor =
    healthPct > 70
      ? "bg-green-500"
      : healthPct > 40
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="border-b border-gray-800 bg-[#111111]">
      <div className="max-w-6xl mx-auto px-4 py-2">
        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
          <Stat label="Pool" value={`$${pool.size.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} green />
          <Stat label="Max Bet" value={`$${maxBet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <Stat label="Total Flips" value={pool.totalFlips.toLocaleString()} />

          {/* Health bar */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500">Pool Health</span>
            <div className="w-24 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${healthColor}`}
                style={{ width: `${healthPct}%` }}
              />
            </div>
            <span className="text-gray-400 font-mono w-10 text-right">
              {healthPct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500">{label}</span>
      <span className={`font-mono font-semibold ${green ? "text-green-400" : "text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}
