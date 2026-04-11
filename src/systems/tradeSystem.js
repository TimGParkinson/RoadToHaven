// ─────────────────────────────────────────────
// ITEM DEFINITIONS
// Scrap is the currency — it is never traded,
// only spent or earned.
// ─────────────────────────────────────────────
export const ITEMS = {
  food: {
    id:          'food',
    name:        'Provisions',
    basePrice:   2,    // scrap per unit
    description: 'Preserved rations. Essential for travel.',
  },
  fuel: {
    id:          'fuel',
    name:        'Fuel',
    basePrice:   3,
    description: 'Refined vehicle fuel. Hard to come by.',
  },
  medicine: {
    id:          'medicine',
    name:        'Medicine',
    basePrice:   6,
    description: 'Bandages and antibiotics. Worth every scrap.',
  },
};

// ─────────────────────────────────────────────
// TRADER DEFINITIONS
// multiplier  — applied to all buy prices
// margin      — sell price = buyPrice × (1 - margin)
//               e.g. 0.5 means trader buys from player at half price
// ─────────────────────────────────────────────
const TRADERS = {
  wanderer: {
    id:          'wanderer',
    name:        'Wandering Trader',
    description: 'A lone figure with a rusted cart. Fair prices, small stock.',
    multiplier:  1.0,
    margin:      0.5,
    art:         '  (o)      \n  /|\\  [__]\n  / \\  |  |\n      [____]',
    stock: {
      food:     [8,  15],   // [min, max] units available
      fuel:     [5,  12],
      medicine: [3,  8 ],
    },
  },
  settlement: {
    id:          'settlement',
    name:        'Settlement Outpost',
    description: 'A fortified trading post. Bigger stock, higher overhead.',
    multiplier:  1.25,
    margin:      0.45,
    art:         '+--------+\n|  TRADE |\n|  POST  |\n+--------+',
    stock: {
      food:     [20, 35],
      fuel:     [15, 25],
      medicine: [8,  15],
    },
  },
  black_market: {
    id:          'black_market',
    name:        'Black Market',
    description: 'No questions asked. Cheap medicine, expensive everything else.',
    multiplier:  0.85,
    margin:      0.35,   // lower margin — takes more cut when buying from you
    art:         '  [???]  \n .-----. \n | $ $ | \n `-----\' ',
    stock: {
      food:     [3,  8 ],
      fuel:     [3,  8 ],
      medicine: [12, 20],
    },
  },
};

export const TRADER_IDS = Object.keys(TRADERS);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Demand modifier — price rises when player is running low
function demandModifier(playerStock) {
  if (playerStock <= 5)  return 1.35;
  if (playerStock <= 15) return 1.15;
  return 1.0;
}

// Round to nearest integer, floor at 1
function price(raw) {
  return Math.max(1, Math.round(raw));
}

// ─────────────────────────────────────────────
// openTradeSession
// ─────────────────────────────────────────────
/**
 * Initialise a trade session with dynamic prices and a trader's inventory.
 * Call this once when the player encounters a trader.
 *
 * Prices vary each session via:
 *   - A random session variance  (±20%)
 *   - A demand modifier          (player's current stock)
 *   - The trader's own multiplier
 *
 * @param {'wanderer'|'settlement'|'black_market'} traderId
 * @param {object} gameState  - current values from useGame()
 * @returns {TradeSession}
 *
 * @example
 * const session = openTradeSession('wanderer', { food: 12, fuel: 5, medicine: 20, scrap: 30 });
 */
export function openTradeSession(traderId, gameState) {
  const trader = TRADERS[traderId];
  if (!trader) throw new Error(`openTradeSession: unknown trader "${traderId}".`);

  // One random variance roll per session — same trader, same day = same prices
  const sessionVariance = randFloat(0.8, 1.2);

  const inventory = {};

  for (const itemId of Object.keys(ITEMS)) {
    const item         = ITEMS[itemId];
    const [sMin, sMax] = trader.stock[itemId];
    const playerStock  = gameState[itemId] ?? 0;

    // Buy price (player pays this to get the item)
    const buyRaw = item.basePrice
      * trader.multiplier
      * sessionVariance
      * demandModifier(playerStock);

    const buyPrice  = price(buyRaw);
    // Sell price (player receives this when selling the item)
    const sellPrice = price(buyPrice * (1 - trader.margin));

    inventory[itemId] = {
      stock:     randInt(sMin, sMax),
      buyPrice,  // scrap cost for player to BUY 1 unit
      sellPrice, // scrap earned for player to SELL 1 unit
    };
  }

  return {
    traderId,
    traderName:  trader.name,
    description: trader.description,
    art:         trader.art,
    inventory,
  };
}

// ─────────────────────────────────────────────
// buyItem
// ─────────────────────────────────────────────
/**
 * Player buys `qty` units of `itemId` from the trader.
 * Costs scrap; increases the item in player's inventory.
 *
 * @param {TradeSession} session
 * @param {string}       itemId   - 'food' | 'fuel' | 'medicine'
 * @param {number}       qty      - how many units to buy
 * @param {object}       gameState
 *
 * @returns {{
 *   success:  boolean,
 *   reason:   string | null,
 *   cost:     number,         // total scrap spent
 *   changes:  object,         // pass to applyChanges()
 * }}
 *
 * @example
 * const result = buyItem(session, 'food', 5, { scrap: 30 });
 * if (result.success) game.applyChanges(result.changes);
 */
export function buyItem(session, itemId, qty, gameState) {
  const slot = session.inventory[itemId];
  if (!slot) return fail(`${itemId} is not available here.`);

  if (qty <= 0)             return fail('Quantity must be at least 1.');
  if (slot.stock < qty)     return fail(`Trader only has ${slot.stock} ${itemId} in stock.`);

  const cost = slot.buyPrice * qty;
  if ((gameState.scrap ?? 0) < cost) {
    return fail(`Not enough scrap. Need ${cost}, have ${gameState.scrap ?? 0}.`);
  }

  // Reduce trader stock in-place (session is mutable between calls)
  slot.stock -= qty;

  return {
    success: true,
    reason:  null,
    cost,
    changes: {
      scrap:   -cost,
      [itemId]: qty,
    },
  };
}

// ─────────────────────────────────────────────
// sellItem
// ─────────────────────────────────────────────
/**
 * Player sells `qty` units of `itemId` to the trader.
 * Earns scrap; reduces the item in player's inventory.
 *
 * @param {TradeSession} session
 * @param {string}       itemId
 * @param {number}       qty
 * @param {object}       gameState
 *
 * @returns {{
 *   success:  boolean,
 *   reason:   string | null,
 *   earned:   number,
 *   changes:  object,
 * }}
 *
 * @example
 * const result = sellItem(session, 'fuel', 10, { fuel: 30, scrap: 5 });
 * if (result.success) game.applyChanges(result.changes);
 */
export function sellItem(session, itemId, qty, gameState) {
  const slot = session.inventory[itemId];
  if (!slot) return fail(`${itemId} cannot be sold here.`);

  if (qty <= 0) return fail('Quantity must be at least 1.');

  const playerStock = gameState[itemId] ?? 0;
  if (playerStock < qty) {
    return fail(`Not enough ${itemId}. Have ${playerStock}, trying to sell ${qty}.`);
  }

  const earned = slot.sellPrice * qty;

  return {
    success: true,
    reason:  null,
    earned,
    changes: {
      scrap:    earned,
      [itemId]: -qty,
    },
  };
}

// ─────────────────────────────────────────────
// getTradePreview
// ─────────────────────────────────────────────
/**
 * Return cost/earn and affordability for a potential trade — without
 * executing it. Use this to drive "buy/sell N" UI controls.
 *
 * @param {TradeSession}      session
 * @param {string}            itemId
 * @param {number}            qty
 * @param {'buy'|'sell'}      type
 * @param {object}            gameState
 *
 * @returns {{
 *   scrapDelta:   number,    // negative = cost, positive = earn
 *   unitPrice:    number,
 *   canAfford:    boolean,
 *   stockOk:      boolean,
 * }}
 */
export function getTradePreview(session, itemId, qty, type, gameState) {
  const slot      = session.inventory[itemId];
  const unitPrice = type === 'buy' ? slot.buyPrice : slot.sellPrice;
  const total     = unitPrice * qty;

  if (type === 'buy') {
    return {
      scrapDelta: -total,
      unitPrice,
      canAfford:  (gameState.scrap ?? 0) >= total,
      stockOk:    slot.stock >= qty,
    };
  }

  return {
    scrapDelta: total,
    unitPrice,
    canAfford:  true,
    stockOk:    (gameState[itemId] ?? 0) >= qty,
  };
}

// ─────────────────────────────────────────────
// pickRandomTrader
// ─────────────────────────────────────────────
/**
 * Pick a random trader ID. Wanderer is most common,
 * black market is rare.
 *
 * @returns {'wanderer'|'settlement'|'black_market'}
 */
export function pickRandomTrader() {
  const weighted = [
    'wanderer', 'wanderer', 'wanderer',
    'settlement', 'settlement',
    'black_market',
  ];
  return weighted[Math.floor(Math.random() * weighted.length)];
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────
function fail(reason) {
  return { success: false, reason, cost: 0, earned: 0, changes: {} };
}
