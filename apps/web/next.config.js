/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@stellar-devkit/core',
    '@stellar-devkit/diagnostics',
    '@stellar-devkit/stellar',
    '@stellar-devkit/ui',
  ],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
