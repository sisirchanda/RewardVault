/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/track/:path*',
        destination: 'http://localhost:4000/track/:path*',
      },
    ];
  },
};

module.exports = nextConfig;