import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isMusicEnabled, setMusicEnabled, playTrack } from '../services/musicService';
import { getPaceInfo, PACE_NAMES } from '../systems/travelSystem';
import Button from '../components/Button';
import sharedStyles, { colors, MONO } from '../styles';
import { STORAGE_KEYS } from '../config/storageKeys';

export default function SettingsScreen({ navigation }) {
  const [musicOn, setMusicOn] = useState(isMusicEnabled());
  const [pace,    setPace]    = useState('normal');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.PACE_PREFERENCE).then(saved => {
      if (saved) setPace(saved);
    });
  }, []);

  async function toggleMusic() {
    const next = !musicOn;
    setMusicOn(next);
    await setMusicEnabled(next);
    if (next) playTrack('travel');
  }

  async function selectPace(p) {
    setPace(p);
    await AsyncStorage.setItem(STORAGE_KEYS.PACE_PREFERENCE, p);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={sharedStyles.screenHeader}>
          <Text style={sharedStyles.screenTitle}>SETTINGS</Text>
        </View>

        {/* ── Music ───────────────────────────── */}
        <Text style={sharedStyles.sectionLabel}>MUSIC</Text>
        <View style={styles.panel}>
          <TouchableOpacity style={styles.row} onPress={toggleMusic}>
            <Text style={styles.rowLabel}>Background Music</Text>
            <Text style={[styles.rowValue, !musicOn && styles.rowValueOff]}>
              {musicOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Travel Pace ─────────────────────── */}
        <Text style={sharedStyles.sectionLabel}>DEFAULT TRAVEL PACE</Text>
        <View style={styles.panel}>
          <Text style={styles.paceHint}>
            Sets the pace used each time you travel. You can change this any time.
          </Text>
          <View style={styles.paceRow}>
            {PACE_NAMES.map(p => {
              const info   = getPaceInfo(p);
              const active = pace === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.paceButton, active && styles.paceButtonActive]}
                  onPress={() => selectPace(p)}
                >
                  <Text style={[styles.paceLabel, active && styles.paceLabelActive]}>
                    {info.label.toUpperCase()}
                  </Text>
                  <Text style={styles.paceMiles}>{info.milesRange}</Text>
                  <Text style={styles.paceDetail}>
                    Food {info.foodRange}  ·  Fuel {info.fuelRange}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button label="Back" onPress={() => navigation.goBack()} variant="secondary" />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  panel: {
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    4,
    padding:         16,
    marginBottom:    24,
  },

  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  rowLabel: {
    fontFamily: MONO,
    fontSize:   14,
    color:      colors.secondary,
  },
  rowValue: {
    fontFamily:  MONO,
    fontSize:    14,
    fontWeight:  'bold',
    color:       colors.primary,
    letterSpacing: 1,
  },
  rowValueOff: {
    color: colors.dim,
  },

  paceHint: {
    fontFamily:   MONO,
    fontSize:     11,
    color:        colors.textMuted,
    marginBottom: 12,
    lineHeight:   17,
  },
  paceRow: {
    gap: 8,
  },
  paceButton: {
    backgroundColor: colors.background,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         12,
    marginBottom:    4,
  },
  paceButtonActive: {
    borderColor: colors.primary,
  },
  paceLabel: {
    fontFamily:    MONO,
    fontSize:      13,
    fontWeight:    'bold',
    color:         colors.textMuted,
    letterSpacing: 1,
    marginBottom:  2,
  },
  paceLabelActive: { color: colors.primary },
  paceMiles: {
    fontFamily: MONO,
    fontSize:   12,
    color:      colors.secondary,
    marginBottom: 2,
  },
  paceDetail: {
    fontFamily: MONO,
    fontSize:   10,
    color:      colors.dim,
  },
});
