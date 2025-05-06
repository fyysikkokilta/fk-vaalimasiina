import bundleAnalyzer from '@next/bundle-analyzer'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  //output: 'standalone',
  experimental: {
    reactCompiler: true,
    //useCache: true,
    serverActions: {
      allowedOrigins: [
        'localhost:8010',
        'localhost:3000',
        (process.env.BASE_URL || 'vaalit.fyysikkokilta.fi').replace(
          /^https?:\/\//,
          ''
        )
      ]
    }
  },
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no'
          }
        ]
      }
    ]
  }
}

export default withBundleAnalyzer(withNextIntl(nextConfig))

initOpenNextCloudflareForDev()
