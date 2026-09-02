import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "photos.zillowstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "www.zillowstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "static.zillowstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "d36xftgacqn2p.cloudfront.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
