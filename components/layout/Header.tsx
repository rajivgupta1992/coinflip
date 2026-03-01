"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PoolState } from "@/app/page";

interface HeaderProps {
  connected: boolean;
  wallet: string;
  balance: number;
  pool: PoolState;
  maxBet: number;
}

export default function Header({ connected, balance }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-[#0d0d0d]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-white">
            Coin<span className="text-green-400">Flip</span>
          </span>
        </div>

        {/* Wallet area */}
        <div className="flex items-center gap-3">
          {connected && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-gray-500">Balance</span>
              <span className="text-sm font-bold text-white font-mono">
                ${balance.toFixed(2)}{" "}
                <span className="text-gray-400 font-normal">USDC</span>
              </span>
            </div>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>
      </div>
    </header>
  );
}
