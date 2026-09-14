import withPWAInit from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  // Exclude Prisma from client-side bundles (works with both Webpack and Turbopack)
  serverExternalPackages: ['@prisma/client', 'prisma'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Prisma Client on the client side (for webpack builds)
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
        '@/lib/db': false,
      };
    }
    return config;
  },
};

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
