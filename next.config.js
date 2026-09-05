/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.43.91'],
    },
  },
  // Allows HMR (Hot Module Replacement) across your local network
  allowedDevOrigins: ['192.168.43.91'],
};

module.exports = nextConfig;
