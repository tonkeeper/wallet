const webpack = require('webpack');
const rewireBabelLoader = require("react-app-rewire-babel-loader");

const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer'),
  };

  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js'];
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  config = rewireBabelLoader.include(
    config,
    resolveApp("../@shared")
  );

  config = rewireBabelLoader.include(
    config,
    resolveApp("../../node_modules/expo")
  );

  config = rewireBabelLoader.exclude(
    config,
    /(node_modules)/
  );

  return config;
};
