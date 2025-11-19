const repoName = process.env.NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH?.trim()
const basePath = repoName ? `/${repoName}` : ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
