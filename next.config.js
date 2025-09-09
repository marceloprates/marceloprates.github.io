/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// Derive the repository name for GitHub Pages basePath when available (fallback to current repo)
const repoName = (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.split('/')[1]) || 'page-test'; // GitHub Pages repo name for basePath

const nextConfig = {
    // Use static export for GitHub Pages
    output: 'export',
    // Produce directory-style URLs so GH Pages serves /path/ as /path/index.html
    trailingSlash: true,
    // All static assets should live under `public/`.
    images: {
        unoptimized: true,
    },
    // Ensure assets resolve correctly on GitHub Pages
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : undefined,
};

module.exports = nextConfig;
