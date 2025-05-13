const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    // Remove CopyWebpackPlugin for src/public to dist to avoid copying sw.js
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
    // new GenerateSW({
    //   clientsClaim: true,
    //   skipWaiting: true,
    //   runtimeCaching: [
    //     {
    //       urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
    //       handler: 'CacheFirst',
    //       options: {
    //         cacheName: 'images-cache',
    //         expiration: {
    //           maxEntries: 50,
    //           maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
    //         },
    //       },
    //     },
    //     {
    //       urlPattern: new RegExp('https://your-api-domain.com'),
    //       handler: 'NetworkFirst',
    //       options: {
    //         cacheName: 'api-cache',
    //         networkTimeoutSeconds: 10,
    //         cacheableResponse: {
    //           statuses: [0, 200],
    //         },
    //         expiration: {
    //           maxEntries: 50,
    //           maxAgeSeconds: 5 * 60, // 5 minutes
    //         },
    //       },
    //     },
    //   ],
    // }),
  ],
};
