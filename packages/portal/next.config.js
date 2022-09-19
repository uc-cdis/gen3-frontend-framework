
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
});

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['mdx', 'tsx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer:
                { and: [/\.(js|ts)x?$/] },
      use: ['@svgr/webpack']
    });
    return config;
  },
  basePath: process.env.BASE_PATH || ''
};

module.exports = (_phase, { defaultConfig }) => {

  // Workaround
  delete defaultConfig.webpackDevMiddleware;
  delete defaultConfig.configOrigin;
  delete defaultConfig.target;
  delete defaultConfig.webpack5;
  delete defaultConfig.amp.canonicalBase;
  delete defaultConfig.experimental.outputFileTracingRoot;
  delete defaultConfig.i18n;

  const plugins = [withMDX]
  return plugins.reduce((acc, plugin) => plugin(acc), { ...defaultConfig, ...nextConfig })
}
