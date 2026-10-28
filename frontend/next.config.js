/** @type {import('next').NextConfig} */
// IMPORTANT: BACKEND_API_URL is read at BUILD time by Next.js rewrites.
// Set this in your Vercel dashboard → Settings → Environment Variables.
// Fallback points to the production Render backend so the site works even without the env var.
const backendUrl =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://smart-attendance-backend.onrender.com';

const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
