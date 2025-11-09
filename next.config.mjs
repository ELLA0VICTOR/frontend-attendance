/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from these domains
    domains: [
      'i.ibb.co', 
      'pinterest.com',
      'localhost', // FIX: Add localhost for development
    ],
    // Also allow remote patterns for more flexibility
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.ibb.co',
      },
    ],
  },
};

export default nextConfig;