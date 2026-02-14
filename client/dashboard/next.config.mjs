/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "api.macautoindia.com",
        port: "",
        pathname: "/public/**",
      },
    ],
  },
};

export default nextConfig;
