/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "**.aliexpress-media.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // For placeholder images during development
      },
    ],
  },
};

export default nextConfig;
