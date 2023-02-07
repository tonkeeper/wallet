const rewireBabelLoader = require("craco-babel-loader");

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
  plugins: [
    {
      plugin: rewireBabelLoader,
      options: {
        includes: [
          resolveApp("../@shared"),
          resolveApp("../../node_modules/expo"),
        ],
        excludes: [/(node_modules)/]
      }
    }
  ]
};
