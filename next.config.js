/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Image optimization settings
  images: {
    unoptimized: true, // Required for static export on Netlify free tier
  },
  
  // Ignore ESLint errors during build (optional, remove if you want strict builds)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build (optional, remove for strict builds)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
