import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet }      from 'react-native';

import { useGame }          from '../context/GameContext';
import { travel }           from '../systems/travelSystem';
import { getRandomEvent }   from '../systems/eventSystem';
import { useRewardedAd }    from '../services/adService';
import ScreenWrapper        from '../components/ScreenWrapper';
import SectionDivider       from '../components/SectionDivider';
import ResourceBar          from '../components/ResourceBar';
import AsciiArt             from '../components/AsciiArt';
import Button               from '../components/Button';
import { colors, MONO }     from '../styles';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const EVENT_CHANCE      = 0.65;
const AD_COOLDOWN_MS    = 120_000; // 2 min cooldown between watches of the same type
const MAX_ADS_PER_RUN   = 5;       // combined cap across fuel + food for the whole run
const AD_SHOW_THRESHOLD = 30;      // only surface ad option when a resource drops below this

const CAR_ART =
`   _______
 ____/|_||_| |__
( (_)______(_)_ )`;

const SCAVENGE_FINDS = [
  { changes: { food: 14 },           log: 'Found canned goods stashed behind a wall panel.' },
  { changes: { fuel: 12 },           log: 'Siphoned fuel from an abandoned vehicle.' },
  { changes: { medicine: 10 },       log: 'Turned up a sealed first-aid kit in the rubble.' },
  { changes: { scrap: 8 },           log: 'Salvaged useful scrap from a collapsed structure.' },
  { changes: { food: 8, scrap: 4 },  log: 'Found provisions and some useful metal parts.' },
  { changes: { fuel: 6, scrap: 5 },  log: 'Scrounged fuel and scrap from a gutted truck.' },
  { changes: {},                      log: 'Searched for an hour. Found nothing worth taking.' },
  { changes: {},                      log: 'The area has already been picked clean.' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deltaLabel(changes) {
  return Object.entries(changes)
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k.toUpperCase()}`)
    .join('   ');
}

function formatCooldown(ms) {
  const secs = Math.ceil(ms / 1000);
  const m    = Math.floor(secs / 60);
  const s    = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function TravelScreen({ navigation }) {
  const game = useGame();

  const [log,              setLog]              = useState('> SYSTEMS NOMINAL. AWAITING ORDERS.');
  const [delta,            setDelta]            = useState('');
  const [scavengeStreak,   setScavengeStreak]   = useState(0);

  const MAX_SCAVENGE_STREAK = 2;
  const scavengeLocked = scavengeStreak >= MAX_SCAVENGE_STREAK;

  // Ad cooldowns — timestamps (ms) when each cooldown expires
  const [fuelCooldownUntil, setFuelCooldownUntil] = useState(0);
  const [foodCooldownUntil, setFoodCooldownUntil] = useState(0);

  // Total ads watched this run — shared limit across fuel + food
  const adsWatched = useRef(0);

  // Clock — only ticks while a cooldown is active
  const [now, setNow] = useState(() => Date.now());
  const anyCooldownActive = now < fuelCooldownUntil || now < foodCooldownUntil;

  useEffect(() => {
    if (!anyCooldownActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyCooldownActive]);

  // ── Event history ────────────────────────────
  const seenEvents = useRef([]);

  // ── Win / death watchers ─────────────────────
  useEffect(() => {
    if (game.hasWon) navigation.replace('Win');
  }, [game.hasWon]);

  useEffect(() => {
    if (game.isDead) {
      const reason = game.fuel <= 0 ? 'fuel' : 'food';
      navigation.replace('GameOver', { reason });
    }
  }, [game.isDead]);

  // ── Rewarded ads ─────────────────────────────
  const fuelAd = useRewardedAd('fuel', (cfg) => {
    game.applyChanges(cfg.changes);
    setLog('> AD REWARD: +20 FUEL added to tank.');
    setDelta('+20 FUEL');
    setFuelCooldownUntil(Date.now() + AD_COOLDOWN_MS);
    adsWatched.current += 1;
  });

  const foodAd = useRewardedAd('food', (cfg) => {
    game.applyChanges(cfg.changes);
    setLog('> AD REWARD: +20 FOOD added to stores.');
    setDelta('+20 FOOD');
    setFoodCooldownUntil(Date.now() + AD_COOLDOWN_MS);
    adsWatched.current += 1;
  });

  // ── Derived ad state ─────────────────────────
  const limitReached       = adsWatched.current >= MAX_ADS_PER_RUN;
  const fuelOnCooldown     = now < fuelCooldownUntil;
  const foodOnCooldown     = now < foodCooldownUntil;
  const fuelCooldownRemain = fuelCooldownUntil - now;
  const foodCooldownRemain = foodCooldownUntil - now;

  const showFuelAd   = !limitReached && game.fuel < AD_SHOW_THRESHOLD;
  const showFoodAd   = !limitReached && game.food < AD_SHOW_THRESHOLD;
  const showAdSection = showFuelAd || showFoodAd;

  const fuelAdBlocked = fuelOnCooldown || !fuelAd.isReady;
  const foodAdBlocked = foodOnCooldown || !foodAd.isReady;

  function fuelAdLabel() {
    if (fuelOnCooldown)  return `FUEL  — available in ${formatCooldown(fuelCooldownRemain)}`;
    if (!fuelAd.isReady) return 'Fuel boost  (loading...)';
    return 'Watch a short ad  →  +20 Fuel';
  }

  function foodAdLabel() {
    if (foodOnCooldown)  return `FOOD  — available in ${formatCooldown(foodCooldownRemain)}`;
    if (!foodAd.isReady) return 'Food boost  (loading...)';
    return 'Watch a short ad  →  +20 Food';
  }

  // ── Main actions ─────────────────────────────
  function handleTravel() {
    const state  = { food: game.food, fuel: game.fuel, morale: game.morale };
    const result = travel(state, 'normal');

    if (!result.canTravel) {
      setLog(`> ${result.blockedReason}`);
      setDelta('');
      return;
    }

    game.applyChanges(result.changes);
    game.advanceDay();
    setScavengeStreak(0);

    setLog(`> Traveled ${result.miles} mi.${result.warnings.length ? '  ! ' + result.warnings[0] : ''}`);
    setDelta(deltaLabel(result.changes));

    const nextDistance = game.distance + result.miles;
    if (nextDistance >= game.totalDistance) return;

    if (Math.random() < EVENT_CHANCE) {
      const event = getRandomEvent(seenEvents.current);
      seenEvents.current = [...seenEvents.current.slice(-3), event.id];
      navigation.navigate('Event', { event });
    }
  }

  function handleScavenge() {
    if (game.food <= 0) {
      setLog('> Too weak to scavenge. Find food first.');
      setDelta('');
      return;
    }

    const find       = pick(SCAVENGE_FINDS);
    const foodCost   = -randInt(3, 6);
    const allChanges = { ...find.changes, food: (find.changes.food ?? 0) + foodCost };

    game.applyChanges(allChanges);
    game.advanceDay();
    setScavengeStreak(s => s + 1);

    setLog(`> ${find.log}`);
    setDelta(deltaLabel(allChanges));
  }

  function handleRest() {
    const moraleGain = randInt(15, 22);
    const foodCost   = -randInt(8, 12);

    game.applyChanges({ morale: moraleGain, food: foodCost });
    game.advanceDay();

    setLog('> Camp made. The group rests through the night.');
    setDelta(deltaLabel({ morale: moraleGain, food: foodCost }));
  }

  // ── Derived display ──────────────────────────
  const progressPercent = Math.min(100, Math.round((game.distance / game.totalDistance) * 100));
  const fuelLow         = game.fuel <= 10;
  const foodLow         = game.food <= 10;
  const travelBlocked   = game.fuel <= 0 || game.food <= 0;

  // ── Render ───────────────────────────────────
  return (
    <ScreenWrapper>

      {/* ── Status header ───────────────────── */}
      <View style={screen.header}>
        <View style={screen.headerItem}>
          <Text style={screen.headerLabel}>DAY</Text>
          <Text style={screen.headerValue}>{game.day}</Text>
        </View>
        <View style={screen.headerDivider} />
        <View style={[screen.headerItem, { flex: 2 }]}>
          <Text style={screen.headerLabel}>DISTANCE</Text>
          <Text style={screen.headerValue}>
            {game.distance}
            <Text style={screen.headerUnit}> / {game.totalDistance} MI</Text>
          </Text>
        </View>
        <View style={screen.headerDivider} />
        <View style={screen.headerItem}>
          <Text style={screen.headerLabel}>TO HAVEN</Text>
          <Text style={[screen.headerValue, progressPercent >= 75 && { color: colors.primary }]}>
            {progressPercent}<Text style={screen.headerUnit}>%</Text>
          </Text>
        </View>
      </View>

      {/* ── Progress track ──────────────────── */}
      <View style={screen.progressTrack}>
        <View style={[screen.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* ── Resources ───────────────────────── */}
      <ResourceBar
        food={game.food} fuel={game.fuel} medicine={game.medicine}
        scrap={game.scrap} morale={game.morale} survivors={game.survivors}
        style={screen.resourceBar}
      />

      {/* ── ASCII car ───────────────────────── */}
      <AsciiArt
        art={CAR_ART}
        color={fuelLow ? colors.warning : colors.primary}
        size={13}
        style={screen.art}
      />

      {/* ── Terminal log ────────────────────── */}
      <View style={screen.logBox}>
        <Text style={screen.logText}>{log}</Text>
        {delta !== '' && <Text style={screen.deltaText}>{delta}</Text>}
      </View>

      {/* ── Warnings ────────────────────────── */}
      {(fuelLow || foodLow) && (
        <View style={screen.warningBox}>
          {fuelLow && <Text style={screen.warningText}>! FUEL CRITICAL — VEHICLE MAY STALL</Text>}
          {foodLow && <Text style={screen.warningText}>! FOOD CRITICAL — GROUP WEAKENING</Text>}
        </View>
      )}

      {/* ── Main actions ────────────────────── */}
      <View style={screen.actions}>
        <Button label="Travel"   onPress={handleTravel}   variant={travelBlocked ? 'dim' : 'primary'} disabled={travelBlocked} />
        <Button label="Scavenge" onPress={handleScavenge} variant={scavengeLocked ? 'dim' : 'secondary'} disabled={scavengeLocked || game.food <= 0} />
        {scavengeLocked && (
          <Text style={screen.scavengeLockText}>! AREA PICKED CLEAN — TRAVEL TO A NEW LOCATION</Text>
        )}
        <Button label="Rest"     onPress={handleRest}     variant="secondary" />
      </View>

      {/* ── Ad rewards — only shown when a resource is low ── */}
      {showAdSection && (
        <View style={screen.adSection}>
          <SectionDivider label="OPTIONAL BOOST" style={{ marginBottom: 10 }} />

          {showFuelAd && (
            <Button
              label={fuelAdLabel()}
              onPress={fuelAd.showAd}
              variant="dim"
              showPrefix={!fuelAdBlocked}
              disabled={fuelAdBlocked}
            />
          )}
          {showFoodAd && (
            <Button
              label={foodAdLabel()}
              onPress={foodAd.showAd}
              variant="dim"
              showPrefix={!foodAdBlocked}
              disabled={foodAdBlocked}
            />
          )}

          <Text style={screen.adMeta}>
            Optional · {adsWatched.current}/{MAX_ADS_PER_RUN} used this run
          </Text>
        </View>
      )}

    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const screen = StyleSheet.create({
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    marginBottom:    6,
  },
  headerItem:    { flex: 1, alignItems: 'center', paddingVertical: 10 },
  headerDivider: { width: 1, height: 36, backgroundColor: colors.panelBorder },
  headerLabel:   { fontFamily: MONO, fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: 3 },
  headerValue:   { fontFamily: MONO, fontSize: 18, fontWeight: 'bold', color: colors.primary },
  headerUnit:    { fontSize: 11, color: colors.textMuted, fontWeight: 'normal' },

  progressTrack: { height: 4, backgroundColor: colors.panel, borderRadius: 2, overflow: 'hidden', marginBottom: 14 },
  progressFill:  { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

  resourceBar: { marginBottom: 6 },

  art: {
    paddingVertical:   16,
    borderTopWidth:    1,
    borderBottomWidth: 1,
    borderColor:       colors.panelBorder,
    marginBottom:      6,
  },

  logBox: {
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         12,
    marginBottom:    6,
    minHeight:       56,
    justifyContent:  'center',
  },
  logText:   { fontFamily: MONO, fontSize: 12, color: colors.secondary, lineHeight: 18 },
  deltaText: { fontFamily: MONO, fontSize: 11, color: colors.textMuted, marginTop: 6, letterSpacing: 1 },

  warningBox:  { borderLeftWidth: 3, borderLeftColor: colors.warning, paddingLeft: 10, paddingVertical: 6, marginBottom: 6, gap: 4 },
  warningText: { fontFamily: MONO, fontSize: 11, color: colors.warning, letterSpacing: 1 },

  actions: { marginTop: 8 },
  scavengeLockText: { fontFamily: MONO, fontSize: 10, color: colors.warning, letterSpacing: 1, marginTop: -6, marginBottom: 6, paddingLeft: 4 },

  adSection: { marginTop: 20 },
  adMeta: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    textAlign:     'center',
    marginTop:     4,
    letterSpacing: 1,
  },
});
