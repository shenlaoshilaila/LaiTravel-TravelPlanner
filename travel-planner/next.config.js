/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["maps.googleapis.com"], // 允许加载地图图片（可选）
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  },
};

module.exports = nextConfig;
