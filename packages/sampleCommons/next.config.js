'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./src/lib/plugins/index.js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});


// Next configuration with support for rewrting API to existing common services
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  basePath: process.env.BASE_PATH || '',
  // async headers() {
  //   return [
  //     {
  //       // matching all API routes
  //       source: "/user/:path*",
  //       headers: [
  //         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
  //         { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
  //         { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
  //       ]
  //     }
  //   ];
  // },
  // async rewrites() {
  //   console.log*('rewrites');
  //   return [
  //     {
  //       source: '/mds/:path*',
  //       destination: 'https://localhost/mds/:path*',
  //     },
  //     {
  //       source: '/user/:path*',
  //       destination: 'https://localhost/user/:path*',
  //     },
  //     {
  //       source: '/_status',
  //       destination: 'https://localhost/_status',
  //     },
  //   ];
  //}
};

module.exports = withMDX(nextConfig);
