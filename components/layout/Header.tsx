"use client";

import { PoolState } from "@/app/page";

interface HeaderProps {
  connected: boolean;
  wallet: string;
  balance: number;
  pool: PoolState;
  maxBet: number;
}

export default function Header({ connected, wallet, balance }: HeaderProps) {
  if (!connected) {
    return (
      <header className="border-b border-gray-800 bg-[#0d0d0d]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-white">
              Coin<span className="text-green-400">Flip</span>
            </span>
          </div>
          <div className="text-xs text-gray-600 font-mono">
            Polygon · USDC
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-gray-800 bg-[#0d0d0d]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-white">
            Coin<span className="text-green-400">Flip</span>
          </span>
        </div>

        {/* Wallet info */}
        <div className="flex items-center gap-3">
          {/* Balance */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-500">Balance</span>
            <span className="text-sm font-bold text-white font-mono">
              ${balance.toFixed(2)}{" "}
              <span className="text-gray-400 font-normal">USDC</span>
            </span>
          </div>

          {/* Wallet pill */}
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
            <span className="text-sm font-mono text-gray-200">{wallet}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
