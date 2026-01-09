/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip TypeScript errors during production build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    // PDF.js worker configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      // Alias for PDF.js worker
      'pdfjs-dist/build/pdf.worker.min.mjs': require.resolve('pdfjs-dist/build/pdf.worker.min.mjs'),
    }

    // Handle PDF.js worker files
    config.module.rules.push({
      test: /\.worker\.(js|mjs)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    })

    // Ensure PDF.js can load properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    }

    return config
  },
  async headers() {
    return [
      {
        // Apply to all routes except /embed
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Allow iframe embedding for /embed routes
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;