import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, polygon } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "CoinFlip",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "placeholder",
  chains: [polygonAmoy, polygon],
  ssr: true,
});
