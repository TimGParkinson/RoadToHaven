import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

/**
 * `// LABEL` header strip with a coloured bottom border.
 *
 * Props:
 *   label        {string}   text to display (include "// " prefix if desired)
 *   color        {string}   text + border color  default: colors.textMuted
 *   borderColor  {string}   override border color only  default: same as color
 *   style        {object}   extra container styles (e.g. marginBottom override)
 */
export default function TerminalHeader({
  label,
  color       = colors.textMuted,
  borderColor,
  style,
}) {
  return (
    <View style={[styles.header, { borderBottomColor: borderColor ?? color }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignSelf:         'stretch',
    borderBottomWidth: 1,
    paddingBottom:     8,
    marginBottom:      16,
  },
  text: {
    fontFamily:    MONO,
    fontSize:      10,
    letterSpacing: 2,
  },
});
