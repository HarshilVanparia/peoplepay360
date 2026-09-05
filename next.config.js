/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.9.220'],
    },
  },
  // Allows HMR (Hot Module Replacement) across your local network
  allowedDevOrigins: ['192.168.9.220', 'localhost'],
};

module.exports = nextConfig;
