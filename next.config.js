/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// Derive the repository name for GitHub Pages basePath when available (fallback to current repo)
const repoName = (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split('/')[1]) || 'marceloprates.github.io'; // GitHub Pages repo name for basePath
// If this is a user/organization Pages repo (username.github.io) we should NOT set a basePath
const isUserPagesRepo = repoName.endsWith('.github.io');

const nextConfig = {
    // Use static export for GitHub Pages
    output: 'export',
    // Produce directory-style URLs so GH Pages serves /path/ as /path/index.html
    trailingSlash: true,
    // All static assets should live under `public/`.
    images: {
        unoptimized: true,
    },
    // Ensure assets resolve correctly on GitHub Pages. Do not set basePath/assetPrefix for user Pages repos.
    basePath: isProd && !isUserPagesRepo ? `/${repoName}` : '',
    assetPrefix: isProd && !isUserPagesRepo ? `/${repoName}/` : undefined,
};

module.exports = nextConfig;
