# CoinFlip — Phase 1 UX Mockup

Provably fair USDC coin flip on Polygon. Phase 1: full interactive mockup, no blockchain.

## Setup

```bash
cd coinflip
npm install   # or: yarn / pnpm install / bun install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's wired up (all in-memory, no wallet)

| State | Description |
|-------|-------------|
| Landing | Hero, pool stats, live feed, Connect Wallet CTA |
| Connected/Idle | Side selector (HEADS/TAILS), bet input, quick % buttons, Flip button |
| Approving | 1s spinner — "Approving USDC..." |
| Placing | 1s spinner — "Placing bet..." |
| Pending VRF | 3–5s spinning coin — "Randomness requested on Chainlink..." + fake request ID |
| WIN | Confetti burst, +$X.XX, auto-advances to tip screen |
| LOSS | Muted animation, −$X.XX, Play Again button |
| TipScreen | Full overlay, 5/10/15/custom%, 10% pre-selected, Skip option |

## Mock data
- Pool: $4,823.50 (updates after each flip)
- Max bet: 5% of pool (recalculates live)
- Player balance: $500.00 USDC
- Background flips auto-populate the feed every 8–14 seconds
