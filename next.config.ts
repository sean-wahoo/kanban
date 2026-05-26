import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: true,
  turbopack: {
    debugIds: true,
  },
};

export default nextConfig;
