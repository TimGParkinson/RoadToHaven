module.exports = function (api) {
  // Invalidate cache when the env flag changes so EAS builds
  // and local Expo Go runs get the right module.
  api.cache.invalidate(() => process.env.DISABLE_ADS_STUB || '');

  const plugins = [];

  // ─────────────────────────────────────────────────────────────
  // In Expo Go (no DISABLE_ADS_STUB), rewrite the ads import at
  // transpile time so Metro never sees the real native package.
  // EAS builds set DISABLE_ADS_STUB=true and get the real module.
  // ─────────────────────────────────────────────────────────────
  if (!process.env.DISABLE_ADS_STUB) {
    plugins.push([
      'module-resolver',
      {
        alias: {
          'react-native-google-mobile-ads': './src/mocks/googleMobileAds.js',
        },
      },
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
