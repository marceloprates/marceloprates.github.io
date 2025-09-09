/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // Enable static exports
    images: {
        unoptimized: true // Required for static export
    },
    basePath: process.env.NODE_ENV === 'production' ? '/page' : '', // Replace 'page' with your repo name
}

module.exports = nextConfig
