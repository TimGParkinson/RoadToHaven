import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

/**
 * Renders a block of ASCII art with preserved spacing.
 *
 * Props:
 *   art    {string}  the ASCII art string — use \n for line breaks
 *   color  {string}  text colour  default: colors.primary
 *   size   {number}  font size    default: 13
 *   style  {object}  extra styles for the outer container
 *
 * @example
 * <AsciiArt art={"  / ^ \\\n ( o o )\n  > W <"} />
 * <AsciiArt art={event.art} color={colors.warning} />
 */
export default function AsciiArt({ art, color = colors.primary, size = 13, style }) {
  if (!art) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.art, { color, fontSize: size, lineHeight: size * 1.55 }]}>
        {art}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    paddingVertical: 12,
  },
  art: {
    fontFamily:         MONO,
    textAlign:          'center',
    includeFontPadding: false,
  },
});
