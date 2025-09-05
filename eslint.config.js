// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'utils/TikTokAnalytics.ts',
      'ios/**',
      'web-build/**',
    ],
    rules: {
      // Flag bare text inside JSX to catch hardcoded copy
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: ['🔥', '✅', '⏹️'],
        },
      ],
    },
  },
]);
