/**
 * Stub for react-native-google-mobile-ads.
 * Used by Metro in Expo Go (via extraNodeModules in metro.config.js).
 * All methods are no-ops — the app runs normally without ads.
 */

const noop = () => {};

const TestIds = {
  REWARDED:              'ca-app-pub-3940256099942544/5224354917',
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
  INTERSTITIAL:          'ca-app-pub-3940256099942544/1033173712',
  BANNER:                'ca-app-pub-3940256099942544/6300978111',
};

const RewardedAdEventType = {
  LOADED:        'loaded',
  EARNED_REWARD: 'earned_reward',
  CLOSED:        'closed',
  ERROR:         'error',
};

const RewardedAd = {
  createForAdRequest: (_adUnitId, _options) => ({
    load:               noop,
    show:               noop,
    // Returns the unsubscribe function — adService stores it to clean up later
    addAdEventListener: (_event, _handler) => noop,
  }),
};

const MobileAds = () => ({
  initialize: () => Promise.resolve(),
});

module.exports = { RewardedAd, RewardedAdEventType, TestIds, MobileAds };
