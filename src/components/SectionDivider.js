import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

/**
 * ─── LABEL ─── horizontal section divider.
 *
 * Props:
 *   label      {string}   centered label text
 *   color      {string}   label text color     default: colors.textMuted
 *   lineColor  {string}   line color           default: colors.panelBorder
 *   style      {object}   extra container styles (e.g. marginBottom override)
 */
export default function SectionDivider({
  label,
  color     = colors.textMuted,
  lineColor = colors.panelBorder,
  style,
}) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  12,
    gap:           8,
  },
  line: {
    flex:   1,
    height: 1,
  },
  label: {
    fontFamily:    MONO,
    fontSize:      9,
    letterSpacing: 2,
  },
});
