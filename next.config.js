/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Allows HMR (Hot Module Replacement) across your local network
  allowedDevOrigins: ['192.168.43.91'],
};

module.exports = nextConfig;