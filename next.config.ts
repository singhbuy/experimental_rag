import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for chromadb trying to load from unpkg.com
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Ignore chromadb-default-embed external dependency
    config.externals = config.externals || [];
    config.externals.push({
      'chromadb-default-embed': 'chromadb-default-embed',
    });

    // Add rule to handle chromadb properly
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    return config;
  },

  experimental: {
    // Ensure chromadb is treated as server-side only
    serverComponentsExternalPackages: ['chromadb'],
  },
};

export default nextConfig;
