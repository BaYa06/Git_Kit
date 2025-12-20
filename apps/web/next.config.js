/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Транспилируем локальные пакеты из монорепо
  transpilePackages: ['@repo/api-client', '@repo/config', '@repo/lib'],
  // Разрешаем загрузку изображений
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
    ],
  },
  async rewrites() {
    // Любой запрос на /v1/* уходит во внутренние API-роуты Next
    return [{ source: '/v1/:path*', destination: '/api/v1/:path*' }];
  },
};
