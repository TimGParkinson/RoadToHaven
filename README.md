# Road to Haven

A post-apocalyptic text survival game built with Expo React Native.

You lead a group of survivors across 2000 miles of wasteland to reach the last safe settlement — Haven. Manage dwindling resources, respond to random encounters, and make hard choices. Every decision matters.

---

## Screenshots

> _Add screenshots here once built on device._

---

## Gameplay

- **Travel** — burn fuel and food to advance toward Haven
- **Scavenge** — search the area for supplies at the cost of food and time
- **Rest** — recover morale at the cost of food
- **Events** — random encounters with choices, consequences, and resource rewards/penalties
- **Game Over** — if food or fuel reaches zero, the run ends
- **Win** — reach 2000 miles and your performance is rated

### Resources

| Resource | Description |
|---|---|
| Food | Required to travel and scavenge. Zero food = game over |
| Fuel | Required to travel. Zero fuel = game over |
| Medicine | Used in certain event outcomes |
| Scrap | Currency for trading and repairs |
| Morale | Affects group performance; capped at 100 |

---

## Monetisation

All ads are **optional and rewarded**. No forced ads, no pay-to-win.

| Ad type | When shown | Reward |
|---|---|---|
| Fuel boost | Fuel < 30 on Travel screen | +20 Fuel |
| Food boost | Food < 30 on Travel screen | +20 Food |
| Revive | On Game Over screen (once per run) | +25 Food, +25 Fuel, +10 Morale |

- 2-minute cooldown per boost type
- Maximum 5 boost ads per run
- Revive is locked to one use per run

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (managed workflow) |
| UI | React Native 0.81 |
| Navigation | React Navigation v7 (stack) |
| State | React Context + useReducer |
| Persistence | @react-native-async-storage/async-storage |
| Ads | react-native-google-mobile-ads v16 (rewarded only) |

---

## Project Structure

```
RoadToHaven/
├── App.js                        # Entry point — GameProvider, SDK init, loading gate
├── app.config.js                 # Expo config (JS) — AdMob plugin registration
├── src/
│   ├── styles.js                 # Design system — colors, fonts, shared stylesheet
│   ├── context/
│   │   └── GameContext.js        # Global game state — useReducer, save/load, derived values
│   ├── navigation/
│   │   └── AppNavigator.js       # Stack navigator
│   ├── screens/
│   │   ├── MainMenuScreen.js     # Title screen with continue/new game options
│   │   ├── TravelScreen.js       # Main gameplay loop
│   │   ├── EventScreen.js        # Random event — choice → outcome flow
│   │   ├── GameOverScreen.js     # Death screen with optional revive ad
│   │   └── WinScreen.js          # Victory screen with performance rating
│   ├── components/
│   │   ├── ScreenWrapper.js      # ScrollView with standard background + padding
│   │   ├── TerminalHeader.js     # "// LABEL" header strip
│   │   ├── SectionDivider.js     # "─── LABEL ───" divider
│   │   ├── StatGrid.js           # Bordered stats table
│   │   ├── Button.js             # Terminal-style [> LABEL] button
│   │   ├── ResourceBar.js        # Horizontal 5-resource strip
│   │   └── AsciiArt.js           # Monospace art block
│   ├── systems/
│   │   ├── travelSystem.js       # travel(state, pace) — pure function
│   │   ├── eventSystem.js        # getRandomEvent(), resolveChoice()
│   │   ├── combatSystem.js       # attack(), flee() — turn-based combat
│   │   ├── tradeSystem.js        # buy/sell with dynamic scrap pricing
│   │   └── saveSystem.js         # AsyncStorage versioned save envelope
│   ├── services/
│   │   └── adService.js          # useRewardedAd() hook, initialiseMobileAds()
│   └── data/
│       └── events.json           # Event pool with weighted random selection
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator, or the Expo Go app on a physical device

### Install

```bash
cd RoadToHaven
npm install
```

### Run

```bash
# Start the Expo dev server
npm start

# Open directly on a platform
npm run android
npm run ios
```

### Ads in development

The ad service automatically uses Google's test ad unit IDs in `__DEV__` mode — no AdMob account is needed to run locally. Replace the placeholder IDs in [adService.js](src/services/adService.js) before publishing.

---

## Design System

All visual constants live in [styles.js](src/styles.js). The theme is a post-apocalyptic terminal UI — monospace everywhere, dark backgrounds, green-on-black palette.

### Colours

| Token | Hex | Use |
|---|---|---|
| `background` | `#0B0F0C` | Screen background |
| `panel` | `#111915` | Card / panel surfaces |
| `panelBorder` | `#1E2B21` | Subtle borders |
| `primary` | `#00FF9C` | Main interactive / highlight |
| `secondary` | `#7CFFB2` | Body text / labels |
| `dim` | `#2E4D38` | Disabled / placeholders |
| `warning` | `#FFC857` | Low resources, caution |
| `danger` | `#FF4C4C` | Death, critical state |
| `textMuted` | `#3D6B4F` | UI labels, captions |

### Font

Monospace on all platforms: `Courier New` (iOS) / `monospace` (Android/default).

---

## Save System

The game auto-saves to AsyncStorage after every state change. Saves use a versioned envelope:

```json
{
  "version": 1,
  "savedAt": 1712345678901,
  "state": { ... }
}
```

Saves with a mismatched version are discarded and the game starts fresh. A mid-run save is detected on the main menu and surfaces a **Continue Run** button.

---

## License

Private project — all rights reserved.
