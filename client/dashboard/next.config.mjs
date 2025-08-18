/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
      },
      {
        protocol: "https",
        hostname: "api.macautoindia.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
