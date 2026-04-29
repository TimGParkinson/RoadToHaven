import { useEffect } from 'react';
import { View, Text, StyleSheet }  from 'react-native';
import { useGame }    from '../context/GameContext';
import { stopMusic }  from '../services/musicService';
import ScreenWrapper  from '../components/ScreenWrapper';
import TerminalHeader from '../components/TerminalHeader';
import StatGrid       from '../components/StatGrid';
import AsciiArt       from '../components/AsciiArt';
import Button         from '../components/Button';
import { colors, MONO } from '../styles';

// ─────────────────────────────────────────────
// ART
// ─────────────────────────────────────────────
const HAVEN_ART =
`   |     |
  /|\\   /|\\
 /_|_\\ /_|_\\
|  _  |  _  |
| |_| | |_| |
|_____|_____|`;

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function WinScreen({ navigation }) {
  const game   = useGame();
  const rating = getPerformanceRating(game);

  useEffect(() => { stopMusic(); }, []);

  async function handlePlayAgain() {
    await game.resetGame();
    navigation.replace('MainMenu');
  }

  return (
    <ScreenWrapper centered>

      {/* ── Terminal header ─────────────────── */}
      <TerminalHeader
        label="// DESTINATION REACHED"
        color={colors.primary}
        style={{ marginBottom: 20 }}
      />

      {/* ── Haven art ───────────────────────── */}
      <AsciiArt art={HAVEN_ART} color={colors.primary} size={14} style={screen.art} />

      {/* ── Title ───────────────────────────── */}
      <Text style={screen.title}>HAVEN REACHED</Text>

      {/* ── Rating badge ────────────────────── */}
      <View style={[screen.ratingBadge, { borderColor: rating.color }]}>
        <Text style={[screen.ratingLabel, { color: rating.color }]}>
          {rating.label}
        </Text>
      </View>

      {/* ── Narrative ───────────────────────── */}
      <View style={screen.textBox}>
        <Text style={screen.promptPrefix}>&gt;</Text>
        <Text style={screen.narrativeText}>
          The gates of Haven open before you. After {game.day} days on the
          road — through storms, ambushes, and impossible odds — your group
          has made it. {rating.text}
        </Text>
      </View>

      {/* ── Final stats ─────────────────────── */}
      <StatGrid
        title="FINAL LOG"
        rows={[
          { label: 'DAYS ON THE ROAD', value: game.day,      accent: false             },
          { label: 'MILES TRAVELED',   value: game.distance, accent: true              },
          { label: 'FOOD REMAINING',   value: game.food,     accent: game.food   > 20  },
          { label: 'FUEL REMAINING',   value: game.fuel,     accent: game.fuel   > 20  },
          { label: 'MEDICINE LEFT',    value: game.medicine, accent: game.medicine > 10 },
          { label: 'SCRAP LEFT',       value: game.scrap,    accent: game.scrap  > 10  },
          { label: 'MORALE',           value: game.morale,   accent: game.morale > 60  },
        ]}
      />

      {/* ── Action ──────────────────────────── */}
      <Button
        label="Play Again"
        onPress={handlePlayAgain}
        variant="primary"
        style={screen.button}
      />

    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────
// PERFORMANCE RATING
// ─────────────────────────────────────────────
function getPerformanceRating(game) {
  const score =
    (game.morale > 60 ? 2 : game.morale > 30 ? 1 : 0) +
    (game.food   > 20 ? 1 : 0) +
    (game.fuel   > 20 ? 1 : 0) +
    (game.day    < 20 ? 2 : game.day < 35 ? 1 : 0);

  if (score >= 5) return {
    label: 'RATING: SURVIVOR',
    color: colors.primary,
    text:  "You arrived with supplies to spare and your group's spirit intact. Few make it this clean.",
  };
  if (score >= 3) return {
    label: 'RATING: ROAD-WORN',
    color: colors.secondary,
    text:  "Battered and low on supplies, but breathing. Haven doesn't care how you look when you arrive.",
  };
  return {
    label: 'RATING: BARELY MADE IT',
    color: colors.warning,
    text:  "The last few miles were on fumes and willpower alone. You made it — that's what counts.",
  };
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const screen = StyleSheet.create({
  art: { marginBottom: 12 },

  title: {
    fontFamily:    MONO,
    fontSize:      22,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 3,
    marginBottom:  16,
    textAlign:     'center',
  },

  ratingBadge: {
    borderWidth:       1,
    borderRadius:      2,
    paddingVertical:   4,
    paddingHorizontal: 14,
    marginBottom:      20,
  },
  ratingLabel: {
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
  promptPrefix: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.primary,
    lineHeight: 20,
    marginTop:  1,
  },
  narrativeText: {
    flex:       1,
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.secondary,
    lineHeight: 22,
    fontStyle:  'italic',
  },

  button: { alignSelf: 'stretch' },
});
