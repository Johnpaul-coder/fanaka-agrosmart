/** @type {import('next').NextConfig} */
const nextConfig = {
  /* This allows your app to load crop images from any external source 
     during development before your database is ready */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
  },
  /* Optional: Helps catch React errors early */
  reactStrictMode: true,
};

export default nextConfig;