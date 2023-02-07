const rewireBabelLoader = require("craco-babel-loader");
const webpack = require('webpack');
const { addPlugins } = require('@craco/craco');

const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  // eslint: {
  //   enable: false,
  // },
  babel: {
    plugins: [
      ["react-native-reanimated/plugin"],   
    ]
  },

  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer'),
      };
      addPlugins(webpackConfig, [new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })]);

      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: rewireBabelLoader,
      options: {
        includes: [
          resolveApp("../@shared"),
          resolveApp("../@locales"),
          resolveApp("../@core-js"),
          resolveApp("../@uikit-js"),
          resolveApp("../../node_modules/expo"),
        ],
        excludes: [/(node_modules)/]
      }
    }
  ]
};
