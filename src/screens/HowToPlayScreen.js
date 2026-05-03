import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors, MONO } from '../styles';

const SECTIONS = [
  {
    title: 'THE GOAL',
    body:  'Survive 2,000 miles of wasteland and reach Haven. Manage your resources carefully — run out of food, fuel, or lose all your survivors and the run ends.',
  },
  {
    title: 'RESOURCES',
    body:  'FOOD — consumed every day. Hit zero and travel stops.\n\nFUEL — consumed every day. Hit zero and the vehicle dies.\n\nMEDICINE — used to treat injuries and illness.\n\nSCRAP — used to barter, repair, and solve problems.\n\nMORALE — the group\'s will to go on. Falls from bad events, rises from rest and good fortune.\n\nSURVIVORS — your group. Lose them all and the run ends.',
  },
  {
    title: 'TRAVEL PACE',
    body:  'Each time you travel, choose a pace:\n\nSLOW (10–20 mi) — conserves supplies but takes longer.\n\nNORMAL (20–35 mi) — balanced risk and distance.\n\nFAST (35–55 mi) — covers ground quickly but burns through food and fuel fast. Risky with low morale.',
  },
  {
    title: 'ACTIONS',
    body:  'TRAVEL — move toward Haven. Costs food and fuel. May trigger a random event.\n\nSCAVENGE — search the area for supplies. Costs a little food. Can only be done twice in a row before you need to move.\n\nREST — recover morale. Costs food. Can only be done once before you need to travel.',
  },
  {
    title: 'EVENTS',
    body:  'After travelling, a random event may occur. Read it carefully — some choices require resources (shown in the option). If you can\'t meet the requirement, that option is locked.',
  },
  {
    title: 'OPTIONAL ADS',
    body:  'When food or fuel drops low, an optional ad boost appears. Watch a short ad to gain +20 of that resource. You can use up to 5 boosts per run — your choice, never forced.',
  },
];

export default function HowToPlayScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.title}>HOW TO PLAY</Text>
        </View>

        {SECTIONS.map(s => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <Button label="Back to Menu" onPress={() => navigation.goBack()} variant="secondary" />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    paddingBottom:     12,
    marginBottom:      20,
  },
  title: {
    fontFamily:    MONO,
    fontSize:      18,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 3,
  },

  section: {
    marginBottom:    20,
    borderLeftWidth: 2,
    borderLeftColor: colors.panelBorder,
    paddingLeft:     12,
  },
  sectionTitle: {
    fontFamily:    MONO,
    fontSize:      22,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 2,
    marginBottom:  6,
    textAlign:     'center',
  },
  sectionBody: {
    fontFamily: MONO,
    fontSize:   13,
    color:      colors.secondary,
    lineHeight: 22,
  },
});
