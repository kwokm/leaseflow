import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  // Pin the trace root to this project. Without it Next walks up and can pick a
  // parent directory's lockfile as the workspace root.
  outputFileTracingRoot: path.join(__dirname),
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
