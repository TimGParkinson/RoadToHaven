/**
 * Stub for react-native-iap.
 * Used in Expo Go (via babel-plugin-module-resolver).
 * All methods are no-ops — the store shows as unavailable without crashing.
 */

const noSub = { remove: () => {} };

const initConnection    = () => Promise.resolve();
const endConnection     = () => Promise.resolve();
const getProducts       = () => Promise.resolve([]);
const requestPurchase   = () => Promise.reject({ code: 'E_USER_CANCELLED' });
const finishTransaction = () => Promise.resolve();

const purchaseUpdatedListener = (_handler) => noSub;
const purchaseErrorListener   = (_handler) => noSub;

module.exports = {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
};
