// ─────────────────────────────────────────────
// PACE CONFIG
// Each pace defines ranges for distance, food,
// and fuel consumed when traveling for one day.
// ─────────────────────────────────────────────
const PACE = {
  slow: {
    label:       'Slow',
    milesMin:    10,
    milesMax:    20,
    foodMin:     4,
    foodMax:     7,
    fuelMin:     3,
    fuelMax:     6,
    description: 'You move carefully, conserving supplies.',
  },
  normal: {
    label:       'Normal',
    milesMin:    20,
    milesMax:    35,
    foodMin:     7,
    foodMax:     11,
    fuelMin:     6,
    fuelMax:     10,
    description: 'A steady pace — balanced risk and progress.',
  },
  fast: {
    label:       'Fast',
    milesMin:    35,
    milesMax:    55,
    foodMin:     11,
    foodMax:     17,
    fuelMin:     10,
    fuelMax:     16,
    description: 'You push hard. Supplies burn quickly.',
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Random integer between min and max (inclusive) */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Build a human-readable log line for the outcome */
function buildLog(pace, miles, foodUsed, fuelUsed, warnings) {
  const lines = [
    `[DAY +1]  Traveled ${miles} miles at a ${pace.label.toLowerCase()} pace.`,
    `Food -${foodUsed}   Fuel -${fuelUsed}`,
  ];
  if (warnings.length > 0) {
    lines.push(...warnings.map(w => `! ${w}`));
  }
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────
/**
 * Calculate the result of traveling for one day at the given pace.
 *
 * This is a pure function — it reads state but never modifies it.
 * Pass the returned `changes` object to `applyChanges()` + `advanceDay()`.
 *
 * @param {object} state   - current game state from GameContext
 * @param {'slow'|'normal'|'fast'} paceName
 *
 * @returns {{
 *   changes:  { distance: number, food: number, fuel: number },
 *   dayChange: 1,
 *   miles:    number,
 *   foodUsed: number,
 *   fuelUsed: number,
 *   warnings: string[],
 *   log:      string,
 *   canTravel: boolean,
 *   blockedReason: string | null,
 * }}
 *
 * @example
 * const result = travel(state, 'normal');
 * if (result.canTravel) {
 *   applyChanges(result.changes);
 *   advanceDay();
 * }
 */
export function travel(state, paceName = 'normal') {
  const pace = PACE[paceName];

  if (!pace) {
    throw new Error(`Unknown pace "${paceName}". Use 'slow', 'normal', or 'fast'.`);
  }

  // ── Pre-travel checks ────────────────────
  if (state.fuel <= 0) {
    return blocked('No fuel. You cannot move the vehicle.');
  }
  if (state.food <= 0) {
    return blocked('No food. The group is too weak to travel.');
  }

  // ── Roll the dice ─────────────────────────
  let   miles    = randInt(pace.milesMin, pace.milesMax);
  let   foodUsed = randInt(pace.foodMin,  pace.foodMax);
  let   fuelUsed = randInt(pace.fuelMin,  pace.fuelMax);

  // ── Morale penalty (low morale = sluggish group, wastes food, moves slower) ──
  if ((state.morale ?? 100) < 30) {
    foodUsed = Math.ceil(foodUsed * 1.15);
    miles    = Math.floor(miles * 0.8);
  }

  // ── Survivor scaling (fewer mouths = less food needed) ───────────
  const survivors = state.survivors ?? 4;
  foodUsed = Math.ceil(foodUsed * (survivors / 4));

  // Cap consumption to what's actually available
  foodUsed = Math.min(foodUsed, state.food);
  fuelUsed = Math.min(fuelUsed, state.fuel);

  // ── Build warnings ────────────────────────
  const warnings = [];

  const foodAfter = state.food - foodUsed;
  const fuelAfter = state.fuel - fuelUsed;

  if (foodAfter <= 10)  warnings.push(`Food critically low (${foodAfter} remaining).`);
  if (fuelAfter <= 10)  warnings.push(`Fuel critically low (${fuelAfter} remaining).`);
  if ((state.morale ?? 100) < 30) {
    warnings.push('Low morale — moving slower and consuming more food.');
  }
  if (paceName === 'fast' && state.morale < 30) {
    warnings.push('Low morale makes fast travel dangerous.');
  }

  // ── Result ────────────────────────────────
  return {
    canTravel:     true,
    blockedReason: null,

    // Pass to applyChanges() — negative values = resources spent
    changes: {
      distance: miles,
      food:    -foodUsed,
      fuel:    -fuelUsed,
    },

    // Pass to advanceDay()
    dayChange: 1,

    // Breakdown (useful for UI display)
    miles,
    foodUsed,
    fuelUsed,
    warnings,
    log: buildLog(pace, miles, foodUsed, fuelUsed, warnings),
  };
}

// ─────────────────────────────────────────────
// PACE INFO  (for rendering choice buttons)
// ─────────────────────────────────────────────
/**
 * Returns display info for a pace — label, description, expected ranges.
 * Use this to populate the pace-selection UI without running the simulation.
 *
 * @param {'slow'|'normal'|'fast'} paceName
 */
export function getPaceInfo(paceName) {
  const pace = PACE[paceName];
  if (!pace) throw new Error(`Unknown pace "${paceName}".`);
  return {
    label:       pace.label,
    description: pace.description,
    milesRange:  `${pace.milesMin}–${pace.milesMax} mi`,
    foodRange:   `${pace.foodMin}–${pace.foodMax}`,
    fuelRange:   `${pace.fuelMin}–${pace.fuelMax}`,
  };
}

/** All three pace names in display order */
export const PACE_NAMES = ['slow', 'normal', 'fast'];

// ─────────────────────────────────────────────
// INTERNAL — blocked result helper
// ─────────────────────────────────────────────
function blocked(reason) {
  return {
    canTravel:     false,
    blockedReason: reason,
    changes:       {},
    dayChange:     0,
    miles:         0,
    foodUsed:      0,
    fuelUsed:      0,
    warnings:      [reason],
    log:           `! ${reason}`,
  };
}
