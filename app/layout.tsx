import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoinFlip — Provably Fair",
  description: "50/50. No rake. Your edge. Provably fair USDC coin flip on Polygon.",
  icons: { icon: "/coinflip/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d0d0d] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
