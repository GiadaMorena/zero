import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // This non-secret identifier is frozen into both client and server bundles.
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.VERCEL_URL || process.env.VERCEL_GIT_COMMIT_SHA || "development",
  },
};
export default nextConfig;
