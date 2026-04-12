// ─────────────────────────────────────────────
// PRODUCT SKU LIST
// These must exactly match the product IDs you create in
// Google Play Console and App Store Connect.
// ─────────────────────────────────────────────
export const PRODUCT_SKUS = [
  'fuel_25',
  'medicine_25',
  'food_25',
  'bundle_all_25',
];

// ─────────────────────────────────────────────
// PRODUCT CONFIGS
// Maps each SKU to its label, description, and
// the game-state changes applied on successful purchase.
// fallbackPrice is shown while the store is loading
// or if the device price cannot be fetched.
// ─────────────────────────────────────────────
export const PRODUCT_CONFIGS = {
  fuel_25: {
    label:         'FUEL CACHE',
    description:   '+25 Fuel  —  keep the engine running',
    changes:       { fuel: 25 },
    fallbackPrice: '$0.99',
  },
  medicine_25: {
    label:         'MEDICAL KIT',
    description:   '+25 Medicine  —  treat the wounded',
    changes:       { medicine: 25 },
    fallbackPrice: '$0.99',
  },
  food_25: {
    label:         'FOOD RATIONS',
    description:   '+25 Food  —  keep the group fed',
    changes:       { food: 25 },
    fallbackPrice: '$0.99',
  },
  bundle_all_25: {
    label:         'SUPPLY BUNDLE',
    description:   '+25 Fuel  ·  +25 Medicine  ·  +25 Food',
    changes:       { fuel: 25, medicine: 25, food: 25 },
    fallbackPrice: '$2.49',
  },
};
