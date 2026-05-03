import EVENTS from '../data/events.json';

let recentEvents = [];
// ─────────────────────────────────────────────
// getRandomEvent
// ─────────────────────────────────────────────
/**
 * Pick a random event, weighted by each event's `weight` field.
 * Higher weight = more likely to appear.
 *
 * @param {string[]} excludeIds - event IDs to skip (recently seen events)
 * @returns {object} a single event object from events.json
 *
 * @example
 * const event = getRandomEvent();
 * const event = getRandomEvent(['road_ambush', 'feral_pack']); // won't repeat these
 */
export function getRandomEvent(excludeIds = [], state = {}) {
  // Combine external excludes + recent history
  const combinedExcludes = [...excludeIds, ...recentEvents];
  // Filter out recently-seen events and events whose requirements aren't met
  let pool = EVENTS.filter(e => {
    if (combinedExcludes.includes(e.id)) return false;
    if (e.requires) {
      if (!Object.entries(e.requires).every(([stat, min]) => (state[stat] ?? 0) >= min)) return false;
    }
    if (e.requiresMax) {
      if (!Object.entries(e.requiresMax).every(([stat, max]) => (state[stat] ?? 0) <= max)) return false;
    }
    return true;
  });

  // If every event has been excluded, reset the pool
  if (pool.length === 0) {
    recentEvents = [];
    pool = EVENTS.filter(e => !excludeIds.includes(e.id));
  }

  // Past 1000 miles, rare/hard events (weight ≤ 2) become 1.5× more likely
  const hardBoost = (state.distance ?? 0) > 1000 ? 1.5 : 1;

  // Weighted random selection
  // e.g. weights [3, 2, 1] → totals 6; roll 0–5.99; pick by cumulative range
  const totalWeight = pool.reduce((sum, e) => {
    const w = (e.weight ?? 1) <= 2 ? (e.weight ?? 1) * hardBoost : (e.weight ?? 1);
    return sum + w;
  }, 0);
  let roll = Math.random() * totalWeight;

  for (const event of pool) {
    const w = (event.weight ?? 1) <= 2 ? (event.weight ?? 1) * hardBoost : (event.weight ?? 1);
    roll -= w;
    if (roll <= 0) {
      // Track recent events
      recentEvents.push(event.id);

      if (recentEvents.length > 10) {
        recentEvents.shift(); // keep last 10
      }

      return event;
    }
  }

  // Fallback — should never reach here
  return pool[pool.length - 1];
}

// ─────────────────────────────────────────────
// resolveChoice
// ─────────────────────────────────────────────
/**
 * Resolve a player's choice for a given event.
 * Checks requirements against current state, then returns the outcome.
 *
 * @param {object} event     - the event object (from getRandomEvent)
 * @param {string} choiceId  - the `id` of the chosen option
 * @param {object} state     - current game state (food, fuel, medicine, scrap, morale…)
 *
 * @returns {{
 *   success:  boolean,       // false if requirements not met
 *   reason:   string | null, // why it failed (shown to the player)
 *   text:     string,        // outcome narrative to display
 *   changes:  object,        // pass this to applyChanges()
 * }}
 *
 * @example
 * const result = resolveChoice(event, 'fight', { food: 30, fuel: 20, ... });
 * if (result.success) {
 *   applyChanges(result.changes);
 * }
 */
export function resolveChoice(event, choiceId, state) {
  const choice = event.choices.find(c => c.id === choiceId);

  if (!choice) {
    throw new Error(
      `resolveChoice: choice "${choiceId}" not found in event "${event.id}".`
    );
  }

  // ── Requirement check ─────────────────────
  if (choice.requires) {
    for (const [stat, minValue] of Object.entries(choice.requires)) {
      const playerValue = state[stat] ?? 0;
      if (playerValue < minValue) {
        return {
          success:  false,
          reason:   `Not enough ${stat} — need ${minValue}, have ${playerValue}.`,
          text:     '',
          changes:  {},
        };
      }
    }
  }

  // ── Return the outcome ────────────────────
  return {
    success:  true,
    reason:   null,
    text:     choice.outcome.text,
    changes:  choice.outcome.changes ?? {},
  };
}

// ─────────────────────────────────────────────
// isChoiceAvailable
// ─────────────────────────────────────────────
/**
 * Check whether a choice's requirements are met by the current state.
 * Use this to disable or grey-out choices in the UI before the player taps.
 *
 * @param {object} choice - a single choice object from an event
 * @param {object} state  - current game state
 * @returns {boolean}
 *
 * @example
 * const available = isChoiceAvailable(choice, { food: 5, fuel: 30, ... });
 */
export function isChoiceAvailable(choice, state) {
  if (!choice.requires) return true;

  return Object.entries(choice.requires).every(
    ([stat, min]) => (state[stat] ?? 0) >= min
  );
}

// ─────────────────────────────────────────────
// getMissingRequirements
// ─────────────────────────────────────────────
/**
 * Returns a human-readable string listing what the player is short on.
 * Useful as a tooltip or sub-label on locked choices.
 *
 * @param {object} choice
 * @param {object} state
 * @returns {string}  e.g. "Needs: 10 medicine, 5 scrap" — or "" if available
 *
 * @example
 * const hint = getMissingRequirements(choice, state);
 * // "Needs: 10 medicine"
 */
export function getMissingRequirements(choice, state) {
  if (!choice.requires) return '';

  const missing = Object.entries(choice.requires)
    .filter(([stat, min]) => (state[stat] ?? 0) < min)
    .map(([stat, min]) => `${min} ${stat}`);

  return missing.length > 0 ? `Needs: ${missing.join(', ')}` : '';
}

// ─────────────────────────────────────────────
// Raw event list (for testing / seeding)
// ─────────────────────────────────────────────
export { EVENTS };
