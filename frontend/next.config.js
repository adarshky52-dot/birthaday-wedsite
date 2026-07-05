/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.STATIC_EXPORT === 'true'
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:5000/api/:path*',
            },
            {
              source: '/uploads/:path*',
              destination: 'http://localhost:5000/uploads/:path*',
            },
          ];
        },
      }),
};

module.exports = nextConfig;
