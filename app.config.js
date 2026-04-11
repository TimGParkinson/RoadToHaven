// app.config.js is evaluated as JavaScript at build time.
// Plugins that use modern JS syntax (like react-native-google-mobile-ads v16)
// must be registered here instead of the static app.json.

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    [
      'react-native-google-mobile-ads',
      {
        // ── Replace these with your real AdMob App IDs before release ──
        // Get them at: https://apps.admob.com
        // These are Google's official test App IDs — safe for development.
        androidAppId: 'ca-app-pub-3940256099942544~3347511713',
        iosAppId:     'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
});
