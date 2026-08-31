import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The story page was merged into the journey; keep old links working.
      { source: '/story', destination: '/journey', permanent: true },
    ];
  },
};

export default nextConfig;
