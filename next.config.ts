import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid noisy persistence/compaction write-lock errors in local dev.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
