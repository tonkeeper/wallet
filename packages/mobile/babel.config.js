const isProd = process.env.NODE_ENV === 'production';

const plugins = [
  ['@babel/plugin-transform-flow-strip-types'],
  ['@babel/plugin-transform-private-methods', { loose: true }],

  ['@babel/plugin-proposal-decorators', { legacy: true }],
  [
    'module-resolver',
    {
      root: ['./'],
      alias: {
        src: './src',
        $api: './src/api',
        $core: './src/core',
        $modals: './src/modals',
        $assets: './src/assets',
        $store: './src/store',
        $uikit: './src/uikit',
        $utils: './src/utils',
        $hooks: './src/hooks',
        $libs: './src/libs',
        $styled: './src/styled',
        $styles: './src/styles',
        $shared: './src/shared',
        $navigation: './src/navigation',
        $translation: './src/translation',
        $wallet: './src/wallet',
        $blockchain: './src/blockchain',
        $database: './src/database',
        $tonconnect: './src/tonconnect',
        $config: './src/config',
      },
    },
  ],
];

// if (isProd) {
//   plugins.push('transform-remove-console');
// }

plugins.push([
  'react-native-reanimated/plugin',
  {
    globals: ['__scanCodes'],
  },
]);

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins,
};
