/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Point at your CDN / image host once storage is wired up.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Schema package ships raw TS; let Next transpile it.
  transpilePackages: ["@portfolio/schema"],
};

export default nextConfig;
