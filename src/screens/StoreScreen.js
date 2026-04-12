import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'react-native-iap';

import { useGame }        from '../context/GameContext';
import ScreenWrapper      from '../components/ScreenWrapper';
import SectionDivider     from '../components/SectionDivider';
import Button             from '../components/Button';
import { colors, MONO }   from '../styles';
import { PRODUCT_SKUS, PRODUCT_CONFIGS } from '../services/iapService';

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function StoreScreen({ navigation }) {
  const game = useGame();

  const [products,   setProducts]   = useState([]);   // fetched from store
  const [loading,    setLoading]    = useState(true);
  const [storeError, setStoreError] = useState('');
  const [purchasing, setPurchasing] = useState(null); // sku currently processing
  const [statusMsg,  setStatusMsg]  = useState('');
  const [buyError,   setBuyError]   = useState('');

  const purchaseUpdateSub = useRef(null);
  const purchaseErrorSub  = useRef(null);

  // ── Initialise IAP connection on mount ───────
  useEffect(() => {
    let connected = false;

    async function setup() {
      try {
        await initConnection();
        connected = true;

        // ── Purchase success listener ──────────
        purchaseUpdateSub.current = purchaseUpdatedListener(async (purchase) => {
          try {
            await finishTransaction({ purchase, isConsumable: true });
            const cfg = PRODUCT_CONFIGS[purchase.productId];
            if (cfg) {
              game.applyChanges(cfg.changes);
              setStatusMsg(`> RECEIVED: ${cfg.label}`);
              setBuyError('');
            }
          } catch {
            setBuyError('Failed to finalise purchase. If charged, contact support.');
          } finally {
            setPurchasing(null);
          }
        });

        // ── Purchase error listener ────────────
        purchaseErrorSub.current = purchaseErrorListener((err) => {
          if (err.code !== 'E_USER_CANCELLED') {
            setBuyError(`Purchase failed: ${err.message}`);
          }
          setPurchasing(null);
        });

        // ── Fetch product details from store ───
        const fetched = await getProducts({ skus: PRODUCT_SKUS });
        // Preserve our preferred display order
        const ordered = PRODUCT_SKUS
          .map(sku => fetched.find(p => p.productId === sku))
          .filter(Boolean);
        setProducts(ordered);

      } catch {
        setStoreError('Store unavailable. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }

    setup();

    return () => {
      purchaseUpdateSub.current?.remove();
      purchaseErrorSub.current?.remove();
      if (connected) endConnection();
    };
  }, []);

  // ── Buy handler ──────────────────────────────
  async function handleBuy(sku) {
    setPurchasing(sku);
    setStatusMsg('');
    setBuyError('');
    try {
      await requestPurchase({ sku });
    } catch (e) {
      if (e.code !== 'E_USER_CANCELLED') {
        setBuyError('Purchase could not be started. Please try again.');
      }
      setPurchasing(null);
    }
  }

  // ── Helpers ──────────────────────────────────
  function priceFor(sku) {
    const p = products.find(p => p.productId === sku);
    return p?.localizedPrice ?? PRODUCT_CONFIGS[sku].fallbackPrice;
  }

  const anyPurchasing = purchasing !== null;

  // ── Render ───────────────────────────────────
  return (
    <ScreenWrapper>

      {/* ── Header ──────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>SUPPLY DEPOT</Text>
        <Text style={s.headerSub}>DAY {game.day}  ·  MILESTONE STOP</Text>
      </View>

      <Text style={s.flavour}>
        A trader's vehicle sits off the road, goods laid out on a folding table.
        They nod as you approach — no questions asked.
      </Text>

      <SectionDivider label="AVAILABLE SUPPLIES" style={{ marginTop: 14, marginBottom: 10 }} />

      {/* ── Loading ─────────────────────────── */}
      {loading && (
        <View style={s.centre}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={s.loadingText}>CONNECTING TO STORE...</Text>
        </View>
      )}

      {/* ── Store error ─────────────────────── */}
      {!loading && storeError !== '' && (
        <View style={s.alertBox}>
          <Text style={s.alertText}>! {storeError}</Text>
        </View>
      )}

      {/* ── Product list ────────────────────── */}
      {!loading && storeError === '' && PRODUCT_SKUS.map(sku => {
        const cfg      = PRODUCT_CONFIGS[sku];
        const isBuying = purchasing === sku;

        return (
          <View key={sku} style={s.productCard}>
            <View style={s.productInfo}>
              <Text style={s.productLabel}>{cfg.label}</Text>
              <Text style={s.productDesc}>{cfg.description}</Text>
            </View>
            <Button
              label={isBuying ? 'PROCESSING...' : priceFor(sku)}
              onPress={() => handleBuy(sku)}
              variant={anyPurchasing ? 'dim' : 'primary'}
              disabled={anyPurchasing}
            />
          </View>
        );
      })}

      {/* ── Status / error feedback ──────────── */}
      {statusMsg !== '' && (
        <View style={s.statusBox}>
          <Text style={s.statusText}>{statusMsg}</Text>
        </View>
      )}
      {buyError !== '' && (
        <View style={s.alertBox}>
          <Text style={s.alertText}>! {buyError}</Text>
        </View>
      )}

      <SectionDivider style={{ marginVertical: 16 }} />

      <Button label="Leave Store" onPress={() => navigation.goBack()} variant="ghost" />

      <Text style={s.legalNote}>
        Purchases are non-refundable and apply to your current run only.
      </Text>

    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    borderBottomWidth:  1,
    borderBottomColor:  colors.primary,
    paddingBottom:      8,
    marginBottom:       14,
  },
  headerTitle: {
    fontFamily:    MONO,
    fontSize:      22,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 2,
    marginTop:     3,
  },

  flavour: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.textSecondary,
    lineHeight: 20,
    fontStyle:  'italic',
  },

  centre: {
    alignItems:  'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontFamily:    MONO,
    fontSize:      11,
    color:         colors.textMuted,
    letterSpacing: 2,
  },

  productCard: {
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         14,
    marginBottom:    10,
  },
  productInfo: {
    marginBottom: 10,
  },
  productLabel: {
    fontFamily:    MONO,
    fontSize:      14,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 1,
    marginBottom:  4,
  },
  productDesc: {
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.textMuted,
    lineHeight: 18,
  },

  statusBox: {
    borderLeftWidth:  3,
    borderLeftColor:  colors.primary,
    paddingLeft:      10,
    paddingVertical:  8,
    marginBottom:     8,
  },
  statusText: {
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.secondary,
  },

  alertBox: {
    borderLeftWidth:  3,
    borderLeftColor:  colors.warning,
    paddingLeft:      10,
    paddingVertical:  8,
    marginBottom:     8,
  },
  alertText: {
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.warning,
  },

  legalNote: {
    fontFamily:    MONO,
    fontSize:      9,
    color:         colors.dim,
    textAlign:     'center',
    marginTop:     8,
    letterSpacing: 1,
  },
});
