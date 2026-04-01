/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mapbox.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_TRACKING_API_KEY: process.env.NEXT_PUBLIC_TRACKING_API_KEY,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
};

module.exports = nextConfig;
