import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/coinflip",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
