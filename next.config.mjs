/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wzufdoabgureypvkahwn.supabase.co",
      },
    ],
  },
};

export default nextConfig;
