/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['genlayer-js'],
  webpack: (config) => {
    // Silence optional deps of wagmi / walletconnect / metamask-sdk
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};
module.exports = nextConfig;
