import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

/**
 * Bordered stats panel with labelled rows.
 * Used by GameOverScreen and WinScreen.
 *
 * Props:
 *   title  {string}             optional section label above the rows
 *   rows   {Array<{
 *             label: string,
 *             value: number|string,
 *             accent?: boolean,  // true → primary color, false/omit → secondary
 *           }>}
 *   style  {object}             extra container styles
 */
export default function StatGrid({ title, rows, style }) {
  return (
    <View style={[styles.panel, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.accent && styles.valueAccent]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf:       'stretch',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    padding:         14,
    marginBottom:    24,
  },
  title: {
    fontFamily:    MONO,
    fontSize:      14,
    fontWeight:    'bold',
    color:         colors.primary,
    letterSpacing: 3,
    textAlign:     'center',
    marginBottom:  12,
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    paddingVertical:   5,
  },
  label: {
    fontFamily:    MONO,
    fontSize:      11,
    color:         colors.textMuted,
    letterSpacing: 1,
  },
  value: {
    fontFamily: MONO,
    fontSize:   11,
    color:      colors.secondary,
    fontWeight: 'bold',
  },
  valueAccent: {
    color: colors.primary,
  },
});
