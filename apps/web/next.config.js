/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    // Любой запрос на /v1/* уходит во внутренние API-роуты Next
    return [{ source: '/v1/:path*', destination: '/api/v1/:path*' }];
  },
};
