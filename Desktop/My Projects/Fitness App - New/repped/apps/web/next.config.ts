import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@repped/shared", "@repped/ui", "@repped/supabase"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
