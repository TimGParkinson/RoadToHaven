import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY     = '@road_to_haven:save';
const SAVE_VERSION = 1; // bump this when INITIAL_STATE shape changes

// ─────────────────────────────────────────────
// saveGame
// ─────────────────────────────────────────────
/**
 * Persist the current game state to AsyncStorage.
 * Wraps the state in a versioned envelope so future
 * schema changes can be handled gracefully.
 *
 * @param {object} state  - raw state from GameContext
 * @returns {Promise<void>}
 */
export async function saveGame(state) {
  const envelope = {
    version:   SAVE_VERSION,
    savedAt:   Date.now(),
    state,
  };
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
}

// ─────────────────────────────────────────────
// loadGame
// ─────────────────────────────────────────────
/**
 * Load a saved game from AsyncStorage.
 * Returns null if no save exists or the data is unreadable.
 *
 * @returns {Promise<object|null>}  the saved state object, or null
 */
export async function loadGame() {
  const raw = await AsyncStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  const envelope = JSON.parse(raw);

  // Unknown version — discard rather than corrupt the game
  if (envelope.version !== SAVE_VERSION) {
    await deleteSave();
    return null;
  }

  return envelope.state ?? null;
}

// ─────────────────────────────────────────────
// hasSave
// ─────────────────────────────────────────────
/**
 * Returns true if a valid save file exists.
 * Use on the MainMenu to show a "Continue" button.
 *
 * @returns {Promise<boolean>}
 */
export async function hasSave() {
  const raw = await AsyncStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  const envelope = JSON.parse(raw);
  return envelope.version === SAVE_VERSION;
}

// ─────────────────────────────────────────────
// deleteSave
// ─────────────────────────────────────────────
/**
 * Wipe the saved game. Called on reset / game over / win.
 *
 * @returns {Promise<void>}
 */
export async function deleteSave() {
  await AsyncStorage.removeItem(SAVE_KEY);
}
