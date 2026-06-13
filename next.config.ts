import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  productionBrowserSourceMaps: true,
  turbopack: {
    debugIds: true,
  },
  basePath: "/kanban",
  assetPrefix: "/kanban-static",
  rewrites: async () => [
    // {
    //   source: "/",
    //   destination: "/kanban",
    // },
    {
      source: "/kanban/images/:path*",
      destination:
        process.env.NODE_ENV !== "production"
          ? `/kanban/images/:path*`
          : `https://${process.env.NEXT_PUBLIC_ROOT_URL?.endsWith("/") ? process.env.NEXT_PUBLIC_ROOT_URL.slice(0, -1) : process.env.NEXT_PUBLIC_ROOT_URL}/kanban/images/:path*`,
    },
  ],
};

export default nextConfig;
