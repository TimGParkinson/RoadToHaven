import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

// ─────────────────────────────────────────────
// RESOURCE CONFIG
// ─────────────────────────────────────────────
const RESOURCES = [
  { key: 'food',     label: 'FOOD', icon: 'F', warnAt: 20, dangerAt: 10, max: null },
  { key: 'fuel',     label: 'FUEL', icon: 'U', warnAt: 20, dangerAt: 10, max: null },
  { key: 'medicine', label: 'MED',  icon: '+', warnAt: 10, dangerAt:  5, max: null },
  { key: 'scrap',    label: 'SCRP', icon: 'S', warnAt:  5, dangerAt:  0, max: null },
  { key: 'morale',   label: 'MRL',  icon: 'M', warnAt: 30, dangerAt: 15, max: 100  },
];

function valueColor(value, resource) {
  if (value <= resource.dangerAt) return colors.danger;
  if (value <= resource.warnAt)   return colors.warning;
  return colors.primary;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
/**
 * Horizontal resource strip — one column per resource.
 *
 * Props:
 *   food      {number}
 *   fuel      {number}
 *   medicine  {number}
 *   scrap     {number}
 *   morale    {number}
 *   style     {object}  optional outer container style
 */
export default function ResourceBar({
  food     = 0,
  fuel     = 0,
  medicine = 0,
  scrap    = 0,
  morale   = 0,
  style,
}) {
  const values = { food, fuel, medicine, scrap, morale };

  return (
    <View style={[styles.container, style]}>
      {RESOURCES.map((res, index) => {
        const value  = Math.max(0, values[res.key] ?? 0);
        const col    = valueColor(value, res);
        const isLast = index === RESOURCES.length - 1;

        return (
          <View key={res.key} style={styles.cellWrapper}>
            <View style={styles.cell}>
              <View style={[styles.iconBadge, { borderColor: col }]}>
                <Text style={[styles.icon, { color: col }]}>{res.icon}</Text>
              </View>
              <Text style={styles.label}>{res.label}</Text>
              <Text style={[styles.value, { color: col }]}>{value}</Text>
            </View>
            {!isLast && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'stretch',
    backgroundColor: colors.panel,
    borderWidth:     1,
    borderColor:     colors.panelBorder,
    borderRadius:    3,
    paddingVertical: 10,
  },
  cellWrapper: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'stretch',
  },
  cell: {
    flex:       1,
    alignItems: 'center',
    gap:        4,
  },
  iconBadge: {
    width:          22,
    height:         22,
    borderWidth:    1,
    borderRadius:   2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: MONO,
    fontSize:   11,
    fontWeight: 'bold',
    lineHeight: 13,
  },
  label: {
    fontFamily:    MONO,
    fontSize:      9,
    color:         colors.textMuted,
    letterSpacing: 1,
  },
  value: {
    fontFamily: MONO,
    fontSize:   15,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  divider: {
    width:           1,
    height:          40,
    alignSelf:       'center',
    backgroundColor: colors.panelBorder,
  },
});
