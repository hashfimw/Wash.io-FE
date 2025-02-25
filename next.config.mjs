/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "www.goteso.com",
      },
      {
        protocol: "https",
        hostname: "www.digitalopeners.com",
      },
    ],
  },
};

export default nextConfig;
