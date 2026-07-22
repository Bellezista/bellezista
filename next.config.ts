import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allows HMR/websocket dev resources when the app is accessed via
  // this VPS's public IP instead of localhost. Next.js 16 blocks cross-origin
  // dev requests by default for safety -- this is scoped to dev, no effect on
  // the production build.
  allowedDevOrigins: ["138.201.253.147"],
  images: {
    // Wildcarded to any Supabase project host (not the current project ref
    // specifically) so switching Supabase projects again -- as already
    // happened once -- doesn't silently break every real uploaded photo the
    // way it just did here. Scoped to the public Storage object path only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
