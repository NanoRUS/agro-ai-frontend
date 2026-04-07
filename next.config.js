/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone output for Docker; Vercel doesn't need it and auto-detects Next.js
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
}

module.exports = nextConfig
