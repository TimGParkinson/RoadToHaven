import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  MobileAds,
} from 'react-native-google-mobile-ads';

// ─────────────────────────────────────────────
// AD UNIT IDs
// TestIds.REWARDED is always used in __DEV__.
// Replace the production strings before release.
// In Expo Go, Metro redirects this import to a stub
// (see metro.config.js) so no native code is called.
// ─────────────────────────────────────────────
const REWARDED_ID = Platform.select({
  android: __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  ios: __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  default: TestIds.REWARDED,
});

// ─────────────────────────────────────────────
// SDK INITIALISATION  (call once in App.js)
// ─────────────────────────────────────────────
let _sdkInitialised = false;

export async function initialiseMobileAds() {
  if (_sdkInitialised) return;
  await MobileAds().initialize();
  _sdkInitialised = true;
}

// ─────────────────────────────────────────────
// REWARD CONFIGS
// ─────────────────────────────────────────────
export const REWARD_CONFIGS = {
  fuel: {
    label:   '+20 Fuel',
    changes: { fuel: 20 },
  },
  food: {
    label:   '+20 Food',
    changes: { food: 20 },
  },
  revive: {
    label:   'Revive',
    changes: { food: 25, fuel: 25, morale: 10 },
  },
};

// ─────────────────────────────────────────────
// useRewardedAd
// ─────────────────────────────────────────────
/**
 * Manages one rewarded ad slot: load → ready → show → reward/dismiss.
 *
 * In Expo Go the import resolves to a stub, so ads never become
 * ready and all ad UI stays hidden/disabled without error.
 *
 * @param {'fuel'|'food'|'revive'} rewardType
 * @param {function} onRewarded  called with the reward config on completion
 */
export function useRewardedAd(rewardType, onRewarded) {
  const [status, setStatus]  = useState('idle');
  const adRef                = useRef(null);
  const listenersRef         = useRef([]);
  const rewardEarnedRef      = useRef(false);
  const isMountedRef         = useRef(true);

  const onRewardedRef = useRef(onRewarded);
  useEffect(() => { onRewardedRef.current = onRewarded; });

  function removeListeners() {
    listenersRef.current.forEach(unsub => unsub());
    listenersRef.current = [];
  }

  function load() {
    removeListeners();
    rewardEarnedRef.current = false;
    if (isMountedRef.current) setStatus('loading');

    const ad = RewardedAd.createForAdRequest(REWARDED_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    listenersRef.current.push(
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (isMountedRef.current) setStatus('ready');
      })
    );

    listenersRef.current.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewardEarnedRef.current = true;
      })
    );

    listenersRef.current.push(
      ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        if (!isMountedRef.current) return;
        setStatus('idle');
        removeListeners();
        if (rewardEarnedRef.current) {
          onRewardedRef.current(REWARD_CONFIGS[rewardType]);
        }
        load();
      })
    );

    listenersRef.current.push(
      ad.addAdEventListener(RewardedAdEventType.ERROR, () => {
        if (!isMountedRef.current) return;
        setStatus('error');
        removeListeners();
        setTimeout(() => {
          if (isMountedRef.current) load();
        }, 30_000);
      })
    );

    ad.load();
  }

  useEffect(() => {
    isMountedRef.current = true;
    load();
    return () => {
      isMountedRef.current = false;
      removeListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function showAd() {
    if (status !== 'ready' || !adRef.current) return;
    setStatus('showing');
    adRef.current.show();
  }

  return {
    status,
    showAd,
    isReady:       status === 'ready',
    isUnavailable: status === 'error',
    config:        REWARD_CONFIGS[rewardType],
  };
}
