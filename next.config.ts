import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "photos.zillowstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "www.zillowstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "static.zillowstatic.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
