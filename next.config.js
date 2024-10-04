/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    domains: ['www.gravatar.com', 'firebasestorage.googleapis.com'],
  },
}

module.exports = nextConfig