module.exports = {
  reactStrictMode: true,
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;
    return api ? [{ source: '/v1/:path*', destination: `${api}/v1/:path*` }] : [];
  },
};
