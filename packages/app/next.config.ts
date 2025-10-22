import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Detailed fetch logging for debugging (dev only)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Performance and build optimizations
  experimental: {
    // Memory and build performance optimizations
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,

    // Optimize imports for icon libraries and large packages
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tooltip",
      "motion",
      "shiki",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obsidian.credit",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
