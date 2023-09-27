module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-native', 'react-hooks', 'import'],
  settings: {
    'react-native/style-sheet-object-names': [
      'Steezy',
    ],
  },
  rules: {
    'react-native/no-unused-styles': 1,
    'react-native/no-inline-styles': 1,
    'react-native/no-color-literals': 1,
    'react-native/no-raw-text': 1,
    'react-native/no-single-element-style-arrays': 1,

    'react-hooks/rules-of-hooks': 1,
    'react-hooks/exhaustive-deps': 1,

    'import/no-default-export': 1,
    'import/no-unused-modules': 1,
    'import/no-cycle': [2, { ignoreExternal: true }],
  },
};
