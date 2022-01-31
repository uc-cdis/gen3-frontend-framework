const withPlugins = require('next-compose-plugins');
const withMDX = require('@next/mdx')({
    extension: /\.(md|mdx)$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: [],
    },
})

const nextConfig = {
    reactStrictMode: true,
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.svg$/,
            issuer:
                { and: [/\.(js|ts)x?$/] },
            use: ['@svgr/webpack'],
        });

        return config
    },
    basePath: process.env.BASE_PATH || ""
};

module.exports = withPlugins([
    [withMDX, { pageExtensions: ["mdx", "tsx"] }],

],nextConfig );
