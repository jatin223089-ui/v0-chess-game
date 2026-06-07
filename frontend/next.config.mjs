/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Local dev only: proxy /api to FastAPI. On Vercel, vercel.json routes /api to the backend.
  async rewrites() {
    if (process.env.VERCEL) return []
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ]
  },
}

export default nextConfig
