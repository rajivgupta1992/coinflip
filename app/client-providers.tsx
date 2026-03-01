"use client";

import dynamic from "next/dynamic";

// Web3 libraries (wagmi/WalletConnect) call localStorage at module init,
// which crashes Node.js prerendering. Load them client-side only.
const Providers = dynamic(() => import("./providers"), { ssr: false });

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
