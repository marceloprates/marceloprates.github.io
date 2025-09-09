/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use static export for GitHub Pages
    output: 'export',
    // Produce directory-style URLs so GH Pages serves /path/ as /path/index.html
    trailingSlash: true,
    // All static assets should live under `public/`.
    images: {
        unoptimized: true,
    },
    // Since this is a user GitHub Pages site (username.github.io), 
    // DO NOT set basePath or assetPrefix - serve from root
    basePath: '',
    assetPrefix: '',
}

module.exports = nextConfig;
