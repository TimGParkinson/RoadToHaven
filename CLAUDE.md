# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development
npx expo start                                        # start Metro dev server (Expo Go — limited, no native modules)
npx expo start --dev-client                           # start with dev client (required for AdMob/IAP/audio)

# Builds via EAS
eas build --profile preview --platform android        # APK for direct install testing
eas build --profile production --platform android     # AAB for Google Play upload
eas build --profile development --platform ios        # iOS dev client (one-time install on device)
```

No test suite or lint script is configured.

## Architecture

### State — `src/context/GameContext.js`
Single `useReducer` for all game state. `useGame()` returns both raw state fields **and** helper functions (`applyChanges`, `advanceDay`, `travel`, `resetGame`, etc.) spread into one object — callers use `game.food`, `game.resetGame()`, etc. from the same hook return.

`isDead` and `hasWon` are **derived** on every render (not stored in state):
```js
const isDead = state.food <= 0 || state.fuel <= 0 || state.survivors <= 0;
const hasWon = state.distance >= TOTAL_DISTANCE;
```
The game auto-saves after every state change via a `useEffect` on `[state, isLoading]`.

### Begin Journey race condition — `src/screens/TravelScreen.js`
`resetGame()` dispatches a RESET but React processes it asynchronously. TravelScreen can mount with stale `isDead=true` state. Fix: `wonMounted` / `deadMounted` refs skip the first fire of the `isDead`/`hasWon` watchers. Do not remove these refs.

### Systems (pure functions)
- `src/systems/travelSystem.js` — `travel(state, pace)` returns a `changes` object; never mutates state. Supports `'slow' | 'normal' | 'fast'`.
- `src/systems/eventSystem.js` — weighted random selection with a recent-5 dedup ring. Filters events by event-level `requires` (stat minimums) and `requiresMax` (stat maximums) before selecting.
- `src/systems/saveSystem.js` — versioned AsyncStorage envelope (`SAVE_VERSION = 1`). Bump `SAVE_VERSION` whenever `INITIAL_STATE` shape changes; old saves are discarded on version mismatch.

### Services
- `src/services/adService.js` — AdMob rewarded ads. `ADS_DISABLED = process.env.EXPO_PUBLIC_ADS_READY !== 'true'`. Set `EXPO_PUBLIC_ADS_READY=true` in `eas.json` only after the app is linked in AdMob (requires Open Testing or Production track on Play Store).
- `src/services/musicService.js` — `expo-av` singleton. Module-level `_gen` counter prevents orphaned sounds from concurrent `playTrack` calls. Track assignment: `tense` (splash + intro), `travel` (main menu + travel screen), `gameover` (game over screen), silence (win screen). `loadMusicSetting()` must be called once in `App.js` before any screen plays a track.
- `src/services/iapService.js` — IAP SKUs for Play Console products.

### Events — `src/data/events.json`
Each event may include top-level `requires` and/or `requiresMax` objects to gate on game state (e.g. `"requires": {"survivors": 2}`). These are enforced by `eventSystem.js`, not the screen.

## Critical constants
| Constant | File | Production value |
|---|---|---|
| `TOTAL_DISTANCE` | `src/context/GameContext.js` | **2000** — do not lower for production builds |
| `EXPO_PUBLIC_ADS_READY` | `eas.json` → production env | `"false"` until AdMob links the app |
| `SAVE_VERSION` | `src/systems/saveSystem.js` | Bump when `INITIAL_STATE` changes |

## Native modules
`react-native-google-mobile-ads` and `react-native-iap` require a dev client or production build — they do not work in Expo Go. Use `npx expo start --dev-client` for device testing.

## Build targets
- Android package: `com.road_to_haven`
- iOS AdMob app ID: placeholder only (`ca-app-pub-XXXXXXXXXXXXXXXX`) — not yet configured
- EAS project ID: `3eb51775-59e4-4f22-beed-7c34b0948b39`
