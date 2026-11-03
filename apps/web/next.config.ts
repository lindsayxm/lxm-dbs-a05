import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** This app lives in a monorepo (apps/web + supabase/); the build must not reach above this folder. */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: appRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
