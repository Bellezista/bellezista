import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allows HMR/websocket dev resources when the app is accessed via
  // this VPS's public IP instead of localhost. Next.js 16 blocks cross-origin
  // dev requests by default for safety -- this is scoped to dev, no effect on
  // the production build.
  allowedDevOrigins: ["138.201.253.147"],
};

export default nextConfig;
