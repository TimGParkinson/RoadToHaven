import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

// ─────────────────────────────────────────────
// VARIANT CONFIG
// Each variant maps to a border + text colour.
// The background is always transparent.
// ─────────────────────────────────────────────
const VARIANTS = {
  primary:   { border: colors.primary,   text: colors.primary   },
  secondary: { border: colors.secondary, text: colors.secondary },
  warning:   { border: colors.warning,   text: colors.warning   },
  danger:    { border: colors.danger,    text: colors.danger    },
  dim:       { border: colors.dim,       text: colors.dim       },
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
/**
 * Terminal-style button.
 *
 * Props:
 *   label    {string}    button text
 *   onPress  {function}  tap handler
 *   variant  {'primary'|'secondary'|'warning'|'danger'|'dim'}  default: 'primary'
 *   disabled {boolean}   greys out and blocks interaction
 *   style    {object}    extra styles for the outer container
 */
export default function Button({
  label,
  onPress,
  variant  = 'primary',
  disabled = false,
  style,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;

  const borderColor = disabled ? colors.dim : v.border;
  const textColor   = disabled ? colors.dim : v.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[
        styles.container,
        { borderColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.bracket, { color: borderColor }]}>[</Text>

      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>

      <Text style={[styles.bracket, { color: borderColor }]}>]</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'transparent',
    borderWidth:       1,
    borderRadius:      2,
    paddingVertical:   12,
    paddingHorizontal: 16,
    marginBottom:      10,
  },
  disabled: {
    opacity: 0.4,
  },
  bracket: {
    fontFamily: MONO,
    fontSize:   14,
    lineHeight: 18,
  },
  label: {
    fontFamily:    MONO,
    fontSize:      14,
    letterSpacing: 1.5,
    lineHeight:    18,
    flex:          1,
    textAlign:     'center',
  },
});
