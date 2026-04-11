import { useState, useEffect }  from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useGame }       from '../context/GameContext';
import { useRewardedAd } from '../services/adService';
import ScreenWrapper     from '../components/ScreenWrapper';
import TerminalHeader    from '../components/TerminalHeader';
import SectionDivider    from '../components/SectionDivider';
import StatGrid          from '../components/StatGrid';
import AsciiArt          from '../components/AsciiArt';
import Button            from '../components/Button';
import { colors, MONO }  from '../styles';

// ─────────────────────────────────────────────
// REASON CONFIG
// ─────────────────────────────────────────────
const REASONS = {
  food: {
    label: 'CAUSE: STARVATION',
    text:  'The food ran out three days ago. Your group grew too weak to continue. The road to Haven stretches on — empty, indifferent.',
    color: colors.warning,
  },
  fuel: {
    label: 'CAUSE: STRANDED',
    text:  'The engine coughs and dies. The tank is dry. No fuel, no movement. The wasteland closes in around a vehicle that will never move again.',
    color: colors.warning,
  },
  combat: {
    label: 'CAUSE: OVERWHELMED',
    text:  "They were too many, too armed. You fought until you couldn't. The road ends here.",
    color: colors.danger,
  },
  default: {
    label: 'CAUSE: UNKNOWN',
    text:  'The wasteland takes people in ways that defy explanation. You are gone.',
    color: colors.danger,
  },
};

const SKULL_ART =
`    _______
   /       \\
  | () () |
   \\  ___  /
    |_____|`;

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function GameOverScreen({ navigation, route }) {
  const game   = useGame();
  const reason = route.params?.reason ?? 'default';
  const config = REASONS[reason] ?? REASONS.default;

  const [reviveEarned, setReviveEarned] = useState(false);

  // ── Rewarded ad ─────────────────────────────
  const reviveAd = useRewardedAd('revive', (cfg) => {
    game.applyChanges(cfg.changes); // restores food + fuel, bumps morale
    game.markRevived();             // locks the revive for the rest of this run
    setReviveEarned(true);
  });

  // Navigate back to Travel once context has updated after revive
  useEffect(() => {
    if (reviveEarned && !game.isDead) {
      navigation.navigate('Travel');
    }
  }, [reviveEarned, game.isDead]);

  function reviveLabel() {
    if (!reviveAd.isReady) return 'LOADING AD...';
    return 'REVIVE WITH AD — WATCH TO CONTINUE';
  }

  async function handleRestart() {
    await game.resetGame();
    navigation.replace('MainMenu');
  }

  // ── Render ───────────────────────────────────
  return (
    <ScreenWrapper centered>

      {/* ── Terminal header ─────────────────── */}
      <TerminalHeader
        label="// SYSTEM: FATAL ERROR"
        color={colors.danger}
        style={{ marginBottom: 20 }}
      />

      {/* ── Skull art ───────────────────────── */}
      <AsciiArt art={SKULL_ART} color={colors.danger} size={14} style={screen.art} />

      {/* ── Title ───────────────────────────── */}
      <Text style={screen.title}>JOURNEY TERMINATED</Text>

      {/* ── Cause badge ─────────────────────── */}
      <View style={[screen.causeBadge, { borderColor: config.color }]}>
        <Text style={[screen.causeLabel, { color: config.color }]}>{config.label}</Text>
      </View>

      {/* ── Narrative ───────────────────────── */}
      <View style={screen.textBox}>
        <Text style={screen.promptPrefix}>&gt;</Text>
        <Text style={screen.narrativeText}>{config.text}</Text>
      </View>

      {/* ── Final stats ─────────────────────── */}
      <StatGrid
        title="FINAL LOG"
        rows={[
          { label: 'DAYS SURVIVED',  value: game.day      },
          { label: 'MILES TRAVELED', value: game.distance },
          { label: 'FOOD',           value: game.food     },
          { label: 'FUEL',           value: game.fuel     },
          { label: 'MEDICINE',       value: game.medicine },
          { label: 'SCRAP',          value: game.scrap    },
          { label: 'MORALE',         value: game.morale   },
        ]}
      />

      {/* ── Revive ad (one time only) ────────── */}
      {!game.hasRevived && (
        <View style={screen.reviveSection}>
          <SectionDivider
            label="// SECOND CHANCE"
            color={colors.warning}
            lineColor={colors.warning + '55'}
          />

          <View style={screen.reviveBox}>
            <Text style={screen.reviveDescription}>
              Watch a short ad to revive your group.{'\n'}
              Restores +25 food, +25 fuel, +10 morale.{'\n'}
              One revive per run only.
            </Text>

            <Button
              label={reviveLabel()}
              onPress={reviveAd.showAd}
              variant="warning"
              showPrefix={reviveAd.isReady}
              disabled={!reviveAd.isReady}
              style={screen.reviveButton}
            />
          </View>
        </View>
      )}

      {/* ── Already revived notice ──────────── */}
      {game.hasRevived && (
        <View style={screen.usedReviveBox}>
          <Text style={screen.usedReviveText}>REVIVE ALREADY USED THIS RUN</Text>
        </View>
      )}

      {/* ── Restart ─────────────────────────── */}
      <Button
        label="Try Again"
        onPress={handleRestart}
        variant="danger"
        style={screen.button}
      />

    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const screen = StyleSheet.create({
  art:   { marginBottom: 12 },

  title: {
    fontFamily:    MONO,
    fontSize:      22,
    fontWeight:    'bold',
    color:         colors.danger,
    letterSpacing: 3,
    marginBottom:  16,
    textAlign:     'center',
  },

  causeBadge: {
    borderWidth:       1,
    borderRadius:      2,
    paddingVertical:   4,
    paddingHorizontal: 14,
    marginBottom:      20,
  },
  causeLabel: {
    fontFamily:    MONO,
    fontSize:      10,
    letterSpacing: 2,
  },

  textBox: {
    flexDirection:   'row',
    alignSelf:       'stretch',
    alignItems:      'flex-start',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         14,
    marginBottom:    20,
    gap:             8,
  },
  promptPrefix:  { fontFamily: MONO, fontSize: 13, color: colors.danger, lineHeight: 20, marginTop: 1 },
  narrativeText: { flex: 1, fontFamily: MONO, fontSize: 13, color: colors.secondary, lineHeight: 22, fontStyle: 'italic' },

  // ── Revive section ──
  reviveSection: { alignSelf: 'stretch', marginBottom: 16 },

  reviveBox: {
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.warning + '55',
    borderRadius:    3,
    padding:         14,
  },
  reviveDescription: {
    fontFamily:    MONO,
    fontSize:      11,
    color:         colors.textMuted,
    lineHeight:    18,
    textAlign:     'center',
    marginBottom:  14,
  },
  reviveButton: { marginBottom: 0 },

  // ── Already used ──
  usedReviveBox: {
    alignSelf:   'stretch',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 3,
    padding:     10,
    marginBottom: 16,
    alignItems:  'center',
  },
  usedReviveText: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 2,
  },

  button: { alignSelf: 'stretch' },
});
