/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ✅ DOCKER: Enable standalone output for optimal container builds
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    // ✅ PERFORMANCE: Built-in Next.js optimizations
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts'
    ],
  },
  
  // ✅ PDF VIEWER: Fix canvas node bindings for @react-pdf-viewer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        'pdf-lib': false,
      }
    }
    return config
  },
  // ✅ PERFORMANCE: Enable built-in bundle optimization
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // 🔒 SECURITY: Critical security headers (Application-Level)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; frame-src 'self' https://db.lia-hair.ch blob:; connect-src 'self' wss: https:; media-src 'self';"
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },
}

export default nextConfig