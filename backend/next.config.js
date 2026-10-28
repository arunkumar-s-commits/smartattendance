/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Standalone output: only ship what's needed — drastically reduces Render deploy size & startup time
  output: 'standalone',
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
    // face-api.js is browser-only — exclude it from the server bundle to avoid bloat
    if (isServer) {
      config.externals = [...(config.externals || []), 'face-api.js'];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS,HEAD' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
