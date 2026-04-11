import { useState, useEffect }  from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useGame }                                              from '../context/GameContext';
import { resolveChoice, isChoiceAvailable, getMissingRequirements } from '../systems/eventSystem';
import ScreenWrapper                                            from '../components/ScreenWrapper';
import TerminalHeader                                           from '../components/TerminalHeader';
import SectionDivider                                           from '../components/SectionDivider';
import AsciiArt                                                 from '../components/AsciiArt';
import Button                                                   from '../components/Button';
import { colors, MONO }                                         from '../styles';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Format a changes object → "-10 FOOD   +15 MORALE"
function formatChanges(changes) {
  const entries = Object.entries(changes);
  if (entries.length === 0) return 'NO CHANGE';
  return entries
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k.toUpperCase()}`)
    .join('   ');
}

// Return a variant string based on net change
function changeVariant(changes) {
  const total = Object.values(changes).reduce((sum, v) => sum + v, 0);
  if (total > 0) return 'primary';
  if (total < 0) return 'danger';
  return 'secondary';
}

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function EventScreen({ navigation, route }) {
  const { event } = route.params;
  const game      = useGame();

  // null = choosing; object = outcome after a choice was made
  const [outcome, setOutcome] = useState(null);

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

  // ── Handle a choice tap ─────────────────────
  function handleChoice(choiceId) {
    const state  = { food: game.food, fuel: game.fuel, medicine: game.medicine, scrap: game.scrap, morale: game.morale };
    const result = resolveChoice(event, choiceId, state);
    if (!result.success) return; // button was disabled — guard anyway
    game.applyChanges(result.changes);
    setOutcome(result);
  }

  function handleContinue() {
    navigation.navigate('Travel');
  }

  // ── Render ──────────────────────────────────
  return (
    <ScreenWrapper>

      {/* ── Terminal header ─────────────────── */}
      <TerminalHeader label="// INCIDENT LOG" />

      {/* ── Event title ─────────────────────── */}
      <Text style={screen.title}>{event.title.toUpperCase()}</Text>

      {/* ── ASCII art ───────────────────────── */}
      {event.art && (
        <AsciiArt
          art={event.art}
          color={colors.secondary}
          size={13}
          style={screen.art}
        />
      )}

      {/* ── Event narrative ─────────────────── */}
      <View style={screen.textBox}>
        <Text style={screen.promptPrefix}>&gt;</Text>
        <Text style={screen.eventText}>{event.text}</Text>
      </View>

      {/* ── Section divider ─────────────────── */}
      <SectionDivider
        label={outcome ? 'OUTCOME' : 'DECISION'}
        style={{ marginBottom: 16 }}
      />

      {/* ══════════════════════════════════════
          PHASE 1 — Choice list
      ══════════════════════════════════════ */}
      {!outcome && (
        <View style={screen.choices}>
          {event.choices.map((choice) => {
            const state     = { food: game.food, fuel: game.fuel, medicine: game.medicine, scrap: game.scrap, morale: game.morale };
            const available = isChoiceAvailable(choice, state);
            const missing   = getMissingRequirements(choice, state);
            const preview   = formatChanges(choice.outcome?.changes ?? {});

            return (
              <View key={choice.id} style={screen.choiceWrapper}>
                <Button
                  label={choice.label}
                  onPress={() => handleChoice(choice.id)}
                  variant={available ? 'primary' : 'dim'}
                  disabled={!available}
                  showPrefix={available}
                />
                <Text style={[screen.choiceMeta, !available && { color: colors.danger }]}>
                  {available ? preview : `LOCKED — ${missing}`}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ══════════════════════════════════════
          PHASE 2 — Outcome
      ══════════════════════════════════════ */}
      {outcome && (
        <View style={screen.outcomeBox}>

          <View style={screen.textBox}>
            <Text style={screen.promptPrefix}>&gt;</Text>
            <Text style={screen.outcomeText}>{outcome.text}</Text>
          </View>

          <View style={[
            screen.deltaBox,
            { borderColor: changeVariant(outcome.changes) === 'danger' ? colors.danger : colors.primary },
          ]}>
            <Text style={screen.deltaLabel}>RESULT</Text>
            <Text style={[
              screen.deltaValue,
              { color: changeVariant(outcome.changes) === 'danger' ? colors.danger : colors.primary },
            ]}>
              {formatChanges(outcome.changes)}
            </Text>
          </View>

          <Button
            label="Continue"
            onPress={handleContinue}
            variant="secondary"
            style={screen.continueButton}
          />
        </View>
      )}

    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const screen = StyleSheet.create({
  title: {
    fontFamily:    MONO,
    fontSize:      20,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 2,
    marginBottom:  4,
  },

  art: {
    borderTopWidth:    1,
    borderBottomWidth: 1,
    borderColor:       colors.panelBorder,
    marginBottom:      4,
  },

  textBox: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         12,
    marginBottom:    16,
    gap:             8,
  },
  promptPrefix: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.primary,
    lineHeight: 20,
    marginTop:  1,
  },
  eventText: {
    flex:       1,
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.secondary,
    lineHeight: 20,
  },

  choices: { gap: 2 },
  choiceWrapper: { marginBottom: 8 },
  choiceMeta: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 1,
    marginTop:     -4,
    paddingLeft:   18,
    marginBottom:  2,
  },

  outcomeBox:   { gap: 12 },
  outcomeText: {
    flex:       1,
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.secondary,
    lineHeight: 20,
    fontStyle:  'italic',
  },
  deltaBox: {
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderRadius:    3,
    padding:         12,
    alignItems:      'center',
    gap:             4,
  },
  deltaLabel: {
    fontFamily:    MONO,
    fontSize:      9,
    color:         colors.textMuted,
    letterSpacing: 3,
  },
  deltaValue: {
    fontFamily:    MONO,
    fontSize:      13,
    fontWeight:    'bold',
    letterSpacing: 1,
  },
  continueButton: { marginTop: 4 },
});
