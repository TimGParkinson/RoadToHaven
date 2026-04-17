import { View, Text, StyleSheet } from 'react-native';
import { colors, MONO } from '../styles';

// ─────────────────────────────────────────────
// RESOURCE CONFIG
// ─────────────────────────────────────────────
const RESOURCES = [
  { key: 'food',      label: 'FOOD',  warnAt: 20, dangerAt: 10, max: null, suffix: ''  },
  { key: 'fuel',      label: 'FUEL',  warnAt: 20, dangerAt: 10, max: null, suffix: ''  },
  { key: 'medicine',  label: 'MEDIC', warnAt: 10, dangerAt:  5, max: null, suffix: ''  },
  { key: 'scrap',     label: 'SCRAP', warnAt:  5, dangerAt:  0, max: null, suffix: ''  },
  { key: 'morale',    label: 'MORAL', warnAt: 30, dangerAt: 15, max: 100,  suffix: '%' },
  { key: 'survivors', label: 'SURV',  warnAt:  3, dangerAt:  2, max: null, suffix: ''  },
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
  food      = 0,
  fuel      = 0,
  medicine  = 0,
  scrap     = 0,
  morale    = 0,
  survivors = 0,
  style,
}) {
  const values = { food, fuel, medicine, scrap, morale, survivors };

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
                <Text style={[styles.icon, { color: col }]}>{res.label}</Text>
              </View>
              <Text style={[styles.value, { color: col }]}>{value}{res.suffix}</Text>
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
    width:          44,
    height:         18,
    borderWidth:    1,
    borderRadius:   2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily:  MONO,
    fontSize:    8,
    fontWeight:  'bold',
    lineHeight:  10,
    textAlign:   'center',
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
