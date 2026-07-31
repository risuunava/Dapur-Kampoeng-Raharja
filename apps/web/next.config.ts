import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dapur-kampoeng/ui", "@dapur-kampoeng/utils", "@dapur-kampoeng/types"],
};

export default nextConfig;
