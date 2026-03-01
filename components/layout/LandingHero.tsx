"use client";

interface LandingHeroProps {
  onConnect: () => void;
}

export default function LandingHero({ onConnect }: LandingHeroProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8 w-full max-w-lg slide-up-fade-in">
      {/* Coin logo */}
      <div className="coin-perspective">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl mx-auto coin-spinning border-4 border-yellow-300">
          <span className="text-5xl font-bold text-yellow-900 select-none">$</span>
        </div>
      </div>

      {/* Headlines */}
      <div className="space-y-3">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Coin<span className="text-green-400">Flip</span>
        </h1>
        <p className="text-xl text-gray-300 font-medium">
          50/50. No rake. Your edge.
        </p>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          Provably fair USDC coin flips powered by Chainlink VRF on Polygon.
          The house never touches the bet — only tips keep the lights on.
        </p>
      </div>

      {/* Connect CTA */}
      <button
        onClick={onConnect}
        className="w-full max-w-xs bg-green-500 hover:bg-green-400 active:bg-green-600 text-black font-bold text-lg py-4 px-8 rounded-xl transition-all duration-150 shadow-lg shadow-green-500/20 hover:shadow-green-400/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        Connect Wallet
      </button>

      {/* Trust signals */}
      <div className="flex items-center gap-6 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          Chainlink VRF
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          0% house edge
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          Polygon USDC
        </span>
      </div>
    </div>
  );
}
