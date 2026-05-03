import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import sharedStyles, { colors, MONO } from '../styles';

export default function RunHistoryScreen({ navigation }) {
  const game = useGame();
  const runs = game.bestRuns ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={sharedStyles.screenHeader}>
          <Text style={sharedStyles.screenTitle}>RUN HISTORY</Text>
          <Text style={styles.subtitle}>Best runs · sorted by distance</Text>
        </View>

        {runs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No runs recorded yet.</Text>
            <Text style={styles.emptyText}>Complete or fail a run to see it here.</Text>
          </View>
        ) : (
          runs.map((run, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rank}>#{i + 1}</Text>
              <View style={styles.rowDetails}>
                <Text style={styles.rowDistance}>{run.distance} mi</Text>
                <Text style={styles.rowMeta}>
                  Day {run.day}  ·  {run.outcome === 'won' ? 'REACHED HAVEN' : 'FALLEN'}
                </Text>
              </View>
              {run.outcome === 'won' && (
                <Text style={styles.winBadge}>★</Text>
              )}
            </View>
          ))
        )}

        <Button label="Back" onPress={() => navigation.goBack()} variant="secondary" />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  subtitle: {
    fontFamily: MONO,
    fontSize:   10,
    color:      colors.textMuted,
    letterSpacing: 1,
  },

  empty: {
    marginVertical: 32,
    alignItems:     'center',
    gap:            8,
  },
  emptyText: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.dim,
    textAlign:  'center',
  },

  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         14,
    marginBottom:    8,
    gap:             12,
  },
  rank: {
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.textMuted,
    width:      28,
  },
  rowDetails: {
    flex: 1,
  },
  rowDistance: {
    fontFamily:   MONO,
    fontSize:     16,
    fontWeight:   'bold',
    color:        colors.primary,
    marginBottom: 2,
  },
  rowMeta: {
    fontFamily:    MONO,
    fontSize:      11,
    color:         colors.textMuted,
    letterSpacing: 1,
  },
  winBadge: {
    fontFamily: MONO,
    fontSize:   18,
    color:      colors.warning,
  },
});
