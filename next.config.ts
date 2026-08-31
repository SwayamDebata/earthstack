import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The story page was merged into the journey; keep old links working.
      { source: '/story', destination: '/journey', permanent: true },
      // The thesis and its evidence live together at /research.
      { source: '/thesis', destination: '/research', permanent: true },
    ];
  },
};

export default nextConfig;
