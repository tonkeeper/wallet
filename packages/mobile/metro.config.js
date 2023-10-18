const { getDefaultConfig } = require('expo/metro-config');
// const { getDefaultConfig } = require('metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// config.resolver.disableHierarchicalLookup = true;

(config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer',
)),
  (config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg'));
config.resolver.sourceExts.push('svg', 'cjs', 'mjs');

config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  http: require.resolve('http-browserify'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify'),
};

config.server.rewriteRequestUrl = (url) => {
  const assets = '/uikit/assets/';
  if (url.startsWith(assets)) {
    url = url.replace(assets, '/assets/../uikit/assets/');
  }

  return url;
};

module.exports = config;
