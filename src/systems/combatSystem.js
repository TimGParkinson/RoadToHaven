// ─────────────────────────────────────────────
// ENEMY DEFINITIONS
// ─────────────────────────────────────────────
export const ENEMIES = {
  bandit: {
    id:          'bandit',
    name:        'Road Bandit',
    maxHp:       80,
    damage:      [12, 22],   // [min, max] per attack
    fleeResist:  0.1,         // adds to player's flee difficulty
    description: 'A desperate survivor with a rusted pipe and nothing to lose.',
    art:         '  (X)  \n  _|_  \n  | |  \n __|__ ',
    loot:        { scrap: 8, food: 5 },
  },
  raider: {
    id:          'raider',
    name:        'Armed Raider',
    maxHp:       110,
    damage:      [20, 35],
    fleeResist:  0.2,
    description: 'Heavily built, heavily armed. Scar across the jaw. Eyes like a dead channel.',
    art:         '  (X)  \n  /|\\  \n  | |  \n [GUN] ',
    loot:        { scrap: 12, fuel: 8 },
  },
  feral: {
    id:          'feral',
    name:        'Feral Pack',
    maxHp:       55,
    damage:      [8, 18],
    fleeResist:  -0.1,        // negative = easier to flee from
    description: 'Three mutated dogs circling low to the ground. Fast, relentless, hungry.',
    art:         '  / ^ \\\n ( o o )\n  > W < ',
    loot:        { scrap: 3 },
  },
  scavenger: {
    id:          'scavenger',
    name:        'Scavenger',
    maxHp:       45,
    damage:      [6, 14],
    fleeResist:  -0.2,
    description: 'Gaunt and twitchy. More scared than you are. Still dangerous.',
    art:         '  (.)  \n  /|\\  \n  | |  ',
    loot:        { food: 10, medicine: 5 },
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Morale boosts player damage output
function moraleBonus(morale) {
  if (morale >= 70) return 10;
  if (morale >= 40) return 5;
  if (morale >= 20) return 0;
  return -5; // broken morale — shaky hands, slow reactions
}

// Morale affects flee success rate
function fleeSuccessChance(morale, enemy) {
  const base = 0.45;
  const bonus = morale >= 60 ? 0.15 : morale >= 30 ? 0.05 : -0.1;
  return Math.min(0.9, Math.max(0.1, base + bonus - enemy.fleeResist));
}

// Build a log entry object
function entry(type, text, damage = null) {
  return { type, text, damage };
}

// ─────────────────────────────────────────────
// COMBAT STATE
// ─────────────────────────────────────────────
/**
 * The shape of a CombatState object.
 *
 * {
 *   player:  { hp: number, maxHp: number },
 *   enemy:   { ...ENEMIES config, hp: number },
 *   turn:    number,
 *   log:     { type, text, damage }[],
 *   status:  'ongoing' | 'victory' | 'defeat' | 'fled',
 * }
 *
 * Pass to attack() or flee() each turn.
 * When status !== 'ongoing', call getCombatChanges() for GameContext deltas.
 */

// ─────────────────────────────────────────────
// initCombat
// ─────────────────────────────────────────────
/**
 * Set up a fresh combat state for a given enemy.
 *
 * @param {'bandit'|'raider'|'feral'|'scavenger'} enemyId
 * @returns {CombatState}
 *
 * @example
 * const combat = initCombat('bandit');
 * // pass combat to attack() or flee() each turn
 */
export function initCombat(enemyId) {
  const template = ENEMIES[enemyId];
  if (!template) throw new Error(`initCombat: unknown enemy "${enemyId}".`);

  return {
    player: { hp: 100, maxHp: 100 },
    enemy:  { ...template, hp: template.maxHp },
    turn:   1,
    log:    [
      entry('start', `${template.name} blocks your path. ${template.description}`),
    ],
    status: 'ongoing',
  };
}

// ─────────────────────────────────────────────
// attack
// ─────────────────────────────────────────────
/**
 * Resolve one full combat turn: player attacks, then enemy retaliates
 * (if still alive). Returns a new CombatState — never mutates the original.
 *
 * @param {CombatState} state
 * @param {number}      morale  - from GameContext, affects damage output
 * @returns {CombatState}
 *
 * @example
 * const next = attack(combatState, game.morale);
 * setCombatState(next);
 * if (next.status !== 'ongoing') {
 *   game.applyChanges(getCombatChanges(next));
 * }
 */
export function attack(state, morale = 50) {
  if (state.status !== 'ongoing') return state;

  const turnLog = [];

  // ── Player attacks ─────────────────────────
  const playerDmg = Math.max(1, randInt(15, 28) + moraleBonus(morale));
  const enemyHpAfterPlayerAtk = Math.max(0, state.enemy.hp - playerDmg);

  turnLog.push(entry(
    'player_attack',
    `You strike the ${state.enemy.name} for ${playerDmg} damage.  [${enemyHpAfterPlayerAtk} / ${state.enemy.maxHp} HP]`,
    playerDmg,
  ));

  // ── Check: enemy defeated ──────────────────
  if (enemyHpAfterPlayerAtk <= 0) {
    turnLog.push(entry(
      'victory',
      `The ${state.enemy.name} goes down. You search the body and move on.`,
    ));
    return {
      ...state,
      enemy:  { ...state.enemy, hp: 0 },
      turn:   state.turn + 1,
      log:    [...state.log, ...turnLog],
      status: 'victory',
    };
  }

  // ── Enemy retaliates ───────────────────────
  const [dmgMin, dmgMax] = state.enemy.damage;
  const enemyDmg         = randInt(dmgMin, dmgMax);
  const playerHpAfter    = Math.max(0, state.player.hp - enemyDmg);

  turnLog.push(entry(
    'enemy_attack',
    `The ${state.enemy.name} hits back for ${enemyDmg} damage.  [Your HP: ${playerHpAfter} / ${state.player.maxHp}]`,
    enemyDmg,
  ));

  // ── Check: player defeated ─────────────────
  if (playerHpAfter <= 0) {
    turnLog.push(entry(
      'defeat',
      `You can't take any more. The ${state.enemy.name} leaves you for dead.`,
    ));
    return {
      ...state,
      player: { ...state.player, hp: 0 },
      enemy:  { ...state.enemy, hp: enemyHpAfterPlayerAtk },
      turn:   state.turn + 1,
      log:    [...state.log, ...turnLog],
      status: 'defeat',
    };
  }

  // ── Combat continues ───────────────────────
  return {
    ...state,
    player: { ...state.player, hp: playerHpAfter },
    enemy:  { ...state.enemy,  hp: enemyHpAfterPlayerAtk },
    turn:   state.turn + 1,
    log:    [...state.log, ...turnLog],
    status: 'ongoing',
  };
}

// ─────────────────────────────────────────────
// flee
// ─────────────────────────────────────────────
/**
 * Attempt to escape combat. Success is not guaranteed.
 * On failure the enemy gets a free hit before the player can try again.
 * Returns a new CombatState — never mutates the original.
 *
 * @param {CombatState} state
 * @param {number}      morale  - higher morale improves flee odds
 * @returns {CombatState}
 *
 * @example
 * const next = flee(combatState, game.morale);
 * setCombatState(next);
 * if (next.status === 'fled') {
 *   game.applyChanges(getCombatChanges(next));
 * }
 */
export function flee(state, morale = 50) {
  if (state.status !== 'ongoing') return state;

  const chance  = fleeSuccessChance(morale, state.enemy);
  const turnLog = [];

  // ── Attempt to flee ────────────────────────
  if (Math.random() < chance) {
    turnLog.push(entry(
      'flee_success',
      `You break away and run. The ${state.enemy.name} doesn't follow.`,
    ));
    return {
      ...state,
      turn:   state.turn + 1,
      log:    [...state.log, ...turnLog],
      status: 'fled',
    };
  }

  // ── Flee failed — enemy free attack ────────
  const [dmgMin, dmgMax] = state.enemy.damage;
  const enemyDmg         = randInt(dmgMin, dmgMax);
  const playerHpAfter    = Math.max(0, state.player.hp - enemyDmg);

  turnLog.push(entry(
    'flee_fail',
    `You can't get clear. The ${state.enemy.name} catches you for ${enemyDmg} damage.`,
    enemyDmg,
  ));

  if (playerHpAfter <= 0) {
    turnLog.push(entry(
      'defeat',
      `Nowhere left to run. You collapse.`,
    ));
    return {
      ...state,
      player: { ...state.player, hp: 0 },
      turn:   state.turn + 1,
      log:    [...state.log, ...turnLog],
      status: 'defeat',
    };
  }

  return {
    ...state,
    player: { ...state.player, hp: playerHpAfter },
    turn:   state.turn + 1,
    log:    [...state.log, ...turnLog],
    status: 'ongoing',
  };
}

// ─────────────────────────────────────────────
// getCombatChanges
// ─────────────────────────────────────────────
/**
 * Translate a finished CombatState into GameContext deltas.
 * Call this once when status is 'victory', 'defeat', or 'fled'.
 * Pass the result to applyChanges().
 *
 * @param {CombatState} state
 * @returns {object}  changes object for applyChanges()
 *
 * @example
 * if (combat.status !== 'ongoing') {
 *   game.applyChanges(getCombatChanges(combat));
 * }
 */
export function getCombatChanges(state) {
  const hpLost      = state.player.maxHp - state.player.hp; // 0–100
  const moraleCost  = -Math.round(hpLost * 0.4);            // up to -40 morale

  switch (state.status) {
    case 'victory':
      return {
        ...state.enemy.loot,
        morale: Math.max(moraleCost + 15, -25), // win bonus softens morale hit
      };

    case 'defeat':
      return {
        food:    -10,
        scrap:   -5,
        morale:  -40,
      };

    case 'fled':
      return {
        fuel:   -8,   // burned fuel to escape
        morale: Math.min(moraleCost - 5, -5),
      };

    default:
      return {};
  }
}
