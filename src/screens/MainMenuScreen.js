import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGame }     from '../context/GameContext';
import Button          from '../components/Button';
import AsciiArt        from '../components/AsciiArt';
import { colors, MONO } from '../styles';

// ─────────────────────────────────────────────
// ART
// ─────────────────────────────────────────────
const ROAD_ART =
`       . H A V E N .
            |
           / \\
          /   \\
         / 2000\\
        / MILES \\
       /_________\\
          [YOU]`;

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function MainMenuScreen({ navigation }) {
  const game = useGame();

  // Show "Continue" when there is an active mid-run save
  const hasMidRun = game.day > 1 && !game.isDead && !game.hasWon;

  function handleContinue() {
    navigation.navigate('Travel');
  }

  async function handleNewGame() {
    // Only reset when there is something to clear — mid-run save, dead state,
    // or won state. If we just arrived from GameOver/Win (which already awaited
    // resetGame), the state is already INITIAL_STATE and a second reset would
    // hang on the redundant async call.
    const needsReset = game.day > 1 || game.isDead || game.hasWon;
    if (needsReset) {
      await game.resetGame();
    }
    navigation.navigate('Travel');
  }

  return (
    <ScrollView
      style={screen.scroll}
      contentContainerStyle={screen.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* ── System boot strip ───────────────── */}
      <View style={screen.bootStrip}>
        <Text style={screen.bootText}>// SYS BOOT · HAVEN NAVIGATION v1.0</Text>
      </View>

      {/* ── Title ───────────────────────────── */}
      <Text style={screen.title}>ROAD TO HAVEN</Text>
      <Text style={screen.subtitle}>A SURVIVAL JOURNEY</Text>

      {/* ── Road art ────────────────────────── */}
      <AsciiArt
        art={ROAD_ART}
        color={colors.dim}
        size={12}
        style={screen.art}
      />

      {/* ── Intro text ──────────────────────── */}
      <View style={screen.introBox}>
        <Text style={screen.promptPrefix}>&gt;</Text>
        <Text style={screen.introText}>
          The world outside is ash and silence.{'\n'}
          2000 miles of wasteland stand between you and Haven.{'\n'}
          Manage your resources. Make hard choices. Survive.
        </Text>
      </View>

      {/* ── Buttons ─────────────────────────── */}
      <View style={screen.buttons}>
        {hasMidRun && (
          <>
            <Button label="Continue Run" onPress={handleContinue} variant="primary" />
            <Text style={screen.saveMeta}>
              Day {game.day}  ·  {game.distance} / {game.totalDistance} mi
            </Text>
          </>
        )}
        <Button
          label={hasMidRun ? 'New Game' : 'Begin Journey'}
          onPress={handleNewGame}
          variant={hasMidRun ? 'secondary' : 'primary'}
        />
      </View>

      {/* ── Footer note ─────────────────────── */}
      <Text style={screen.footer}>
        OPT-IN ADS ONLY  ·  NO PAY-TO-WIN  ·  FULL RUN FREE
      </Text>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const screen = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center', paddingBottom: 40 },

  bootStrip: {
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    paddingBottom:     8,
    marginBottom:      28,
  },
  bootText: {
    fontFamily:    MONO,
    fontSize:      9,
    color:         colors.textMuted,
    letterSpacing: 1,
  },

  title: {
    fontFamily:    MONO,
    fontSize:      28,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 4,
    textAlign:     'center',
    marginBottom:  4,
  },
  subtitle: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 4,
    textAlign:     'center',
    marginBottom:  4,
  },

  art: {
    marginVertical:    16,
    borderTopWidth:    1,
    borderBottomWidth: 1,
    borderColor:       colors.panelBorder,
  },

  introBox: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         14,
    marginBottom:    24,
    gap:             8,
  },
  promptPrefix: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.primary,
    lineHeight: 20,
    marginTop:  1,
  },
  introText: {
    flex:       1,
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.secondary,
    lineHeight: 20,
  },

  buttons:  { marginBottom: 8 },
  saveMeta: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    textAlign:     'center',
    letterSpacing: 1,
    marginTop:     -4,
    marginBottom:  12,
  },

  footer: {
    fontFamily:    MONO,
    fontSize:      9,
    color:         colors.dim,
    textAlign:     'center',
    letterSpacing: 2,
    marginTop:     12,
  },
});
