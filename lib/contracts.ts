export const COINFLIP_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const USDC_ADDRESS = process.env
  .NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

// ── ABI ─────────────────────────────────────────────────────────────────────
// Generated from: forge build && cat contracts/out/CoinFlip.sol/CoinFlip.json
// Replace with the full ABI after running `make build` in contracts/.

export const COINFLIP_ABI = [
  // ── View ──────────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "poolSize",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalFlips",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxBet",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingBets",
    inputs: [{ name: "requestId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "player", type: "address", internalType: "address" },
      { name: "isHeads", type: "bool", internalType: "bool" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },

  // ── Write ─────────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "flip",
    inputs: [
      { name: "isHeads", type: "bool", internalType: "bool" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "requestId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tip",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // ── Events ────────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "player",    type: "address", indexed: true },
      { name: "isHeads",   type: "bool",    indexed: false },
      { name: "amount",    type: "uint256", indexed: false },
      { name: "requestId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "BetSettled",
    inputs: [
      { name: "player",    type: "address", indexed: true },
      { name: "isHeads",   type: "bool",    indexed: false },
      { name: "won",       type: "bool",    indexed: false },
      { name: "amount",    type: "uint256", indexed: false },
      { name: "requestId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "Tipped",
    inputs: [
      { name: "player",  type: "address", indexed: true },
      { name: "amount",  type: "uint256", indexed: false },
      { name: "toPool",  type: "uint256", indexed: false },
      { name: "toHouse", type: "uint256", indexed: false },
    ],
  },
] as const;

// Polygon Amoy chain ID — used to gate testnet-only UI
export const AMOY_CHAIN_ID = 80002;

// Minimal ERC-20 ABI for approve + balanceOf + testnet faucet
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount",  type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner",   type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "faucet",
    inputs: [
      { name: "to",     type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
