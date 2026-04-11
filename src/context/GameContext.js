import { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { saveGame, loadGame, deleteSave } from '../systems/saveSystem';

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
export const INITIAL_STATE = {
  day:        1,
  distance:   0,
  food:       350,
  fuel:       200,
  medicine:   30,
  scrap:      15,
  morale:     75,
  hasRevived: false, // true once the player uses the revive ad — locked for the run
};

export const TOTAL_DISTANCE = 2000;

// Only these keys may be mutated by applyChanges/modifyStat.
// Boolean flags like hasRevived are protected from accidental numeric delta.
const NUMERIC_KEYS = new Set(['day', 'distance', 'food', 'fuel', 'medicine', 'scrap', 'morale']);

// ─────────────────────────────────────────────
// ACTION TYPES
// ─────────────────────────────────────────────
const ACTIONS = {
  ADVANCE_DAY:   'ADVANCE_DAY',
  TRAVEL:        'TRAVEL',
  MODIFY_STAT:   'MODIFY_STAT',
  APPLY_CHANGES: 'APPLY_CHANGES',
  MARK_REVIVED:  'MARK_REVIVED',
  RESET:         'RESET',
  LOAD_STATE:    'LOAD_STATE',
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

const CAPPED_STATS = new Set(['morale']);

function applyDelta(state, key, delta) {
  const next = (state[key] ?? 0) + delta;
  return CAPPED_STATS.has(key) ? clamp(next) : Math.max(0, next);
}

// ─────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case ACTIONS.ADVANCE_DAY:
      return { ...state, day: state.day + 1 };

    case ACTIONS.TRAVEL:
      return { ...state, distance: state.distance + action.miles };

    case ACTIONS.MODIFY_STAT:
      if (!NUMERIC_KEYS.has(action.stat)) return state;
      return { ...state, [action.stat]: applyDelta(state, action.stat, action.amount) };

    case ACTIONS.APPLY_CHANGES: {
      const next = { ...state };
      for (const [key, delta] of Object.entries(action.changes)) {
        if (NUMERIC_KEYS.has(key)) next[key] = applyDelta(next, key, delta);
      }
      return next;
    }

    // Lock the revive — can only be used once per run
    case ACTIONS.MARK_REVIVED:
      return { ...state, hasRevived: true };

    case ACTIONS.LOAD_STATE:
      return { ...INITIAL_STATE, ...action.state };

    case ACTIONS.RESET:
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const GameContext = createContext(null);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch]         = useReducer(gameReducer, INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGame()
      .then(saved => {
        if (saved) dispatch({ type: ACTIONS.LOAD_STATE, state: saved });
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) saveGame(state);
  }, [state, isLoading]);

  // ── Update functions ──────────────────────

  function advanceDay()              { dispatch({ type: ACTIONS.ADVANCE_DAY }); }
  function travel(miles)             { dispatch({ type: ACTIONS.TRAVEL, miles }); }
  function modifyStat(stat, amount)  { dispatch({ type: ACTIONS.MODIFY_STAT, stat, amount }); }
  function applyChanges(changes)     { dispatch({ type: ACTIONS.APPLY_CHANGES, changes }); }
  function markRevived()             { dispatch({ type: ACTIONS.MARK_REVIVED }); }

  async function resetGame() {
    try {
      await deleteSave();
    } catch {
      // key may not exist — safe to ignore
    }
    dispatch({ type: ACTIONS.RESET });
  }

  // ── Derived values ────────────────────────

  const hasWon          = state.distance >= TOTAL_DISTANCE;
  const isDead          = state.food <= 0 || state.fuel <= 0;
  const progressPercent = Math.min(100, Math.round((state.distance / TOTAL_DISTANCE) * 100));

  const value = {
    ...state,
    totalDistance: TOTAL_DISTANCE,
    hasWon,
    isDead,
    progressPercent,
    isLoading,
    advanceDay,
    travel,
    modifyStat,
    applyChanges,
    markRevived,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}

export default GameContext;
