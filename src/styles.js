import { StyleSheet, Platform } from 'react-native';

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
export const colors = {
  background:  '#0B0F0C',  // deep terminal black
  panel:       '#111915',  // slightly raised surface
  panelBorder: '#1E2B21',  // subtle border between panels

  primary:     '#00FF9C',  // bright green — main interactive / highlight
  secondary:   '#7CFFB2',  // softer green — secondary text / labels
  dim:         '#6AAF85',  // muted green — disabled / placeholders

  warning:     '#FFC857',  // amber — low resources, caution
  danger:      '#FF4C4C',  // red — death, critical state
  success:     '#00FF9C',  // alias for primary (kept explicit for semantics)

  textPrimary:   '#00FF9C',
  textSecondary: '#7CFFB2',
  textMuted:     '#99FBBF',
  textInverse:   '#0B0F0C', // used on filled buttons
};

// ─────────────────────────────────────────────
// TYPOGRAPHY  (monospace everywhere)
// ─────────────────────────────────────────────
export const MONO = Platform.select({
  ios:     'Courier New',
  android: 'monospace',
  default: 'monospace',
});

export const fonts = {
  family: MONO,

  // sizes
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   20,
  xl:   26,
  xxl:  34,
};

// ─────────────────────────────────────────────
// SHARED STYLESHEET
// ─────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── SCREENS ───────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  screenCentered: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  // ── PANELS ────────────────────────────────
  panel: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  panelFlush: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 4,
  },
  panelHighlight: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },

  // ── TYPOGRAPHY ────────────────────────────
  // Page-level title  (e.g. "ROAD TO HAVEN")
  titleLarge: {
    fontFamily: MONO,
    fontSize: fonts.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 4,
  },
  // Section heading
  heading: {
    fontFamily: MONO,
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  // Sub-heading / card title
  subheading: {
    fontFamily: MONO,
    fontSize: fonts.lg,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  // Main body copy
  body: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.secondary,
    lineHeight: 22,
  },
  // Italic narrative / flavour text
  flavour: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  // Small label (uppercased UI labels)
  label: {
    fontFamily: MONO,
    fontSize: fonts.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Caption / hint
  caption: {
    fontFamily: MONO,
    fontSize: fonts.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  // Muted / disabled text
  dimText: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.dim,
  },
  // Inline warning text
  warningText: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.warning,
  },
  // Inline danger text
  dangerText: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.danger,
  },

  // ── BUTTONS ───────────────────────────────
  // Filled — primary action
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonPrimaryText: {
    fontFamily: MONO,
    fontSize: fonts.md,
    fontWeight: 'bold',
    color: colors.textInverse,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Outlined — secondary action
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondaryText: {
    fontFamily: MONO,
    fontSize: fonts.md,
    color: colors.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Danger / destructive
  buttonDanger: {
    backgroundColor: colors.danger,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDangerText: {
    fontFamily: MONO,
    fontSize: fonts.md,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Ghost — lowest emphasis
  buttonGhost: {
    backgroundColor: 'transparent',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 3,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonGhostText: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Disabled state (apply to any button container)
  buttonDisabled: {
    opacity: 0.35,
  },

  // ── CHOICE / LIST ITEM BUTTON ──────────────
  choiceButton: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 3,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  choiceButtonActive: {
    borderColor: colors.primary,
  },
  choiceLabel: {
    fontFamily: MONO,
    fontSize: fonts.md,
    color: colors.primary,
    marginBottom: 3,
  },
  choiceMeta: {
    fontFamily: MONO,
    fontSize: fonts.sm,
    color: colors.textMuted,
    letterSpacing: 1,
  },

  // ── STAT BADGES ───────────────────────────
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 3,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statBadgeLabel: {
    fontFamily: MONO,
    fontSize: fonts.xs,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statBadgeValue: {
    fontFamily: MONO,
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.primary,       // override per-stat for warnings
  },
  statBadgeUnit: {
    fontFamily: MONO,
    fontSize: fonts.xs,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── PROGRESS BAR ──────────────────────────
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: MONO,
    fontSize: fonts.sm,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontFamily: MONO,
    fontSize: fonts.sm,
    color: colors.secondary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.panel,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressFillWarning: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 2,
  },
  progressFillDanger: {
    height: '100%',
    backgroundColor: colors.danger,
    borderRadius: 2,
  },

  // ── DIVIDERS ──────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.panelBorder,
    marginVertical: 16,
  },
  dividerPrimary: {
    height: 1,
    backgroundColor: colors.dim,
    marginVertical: 16,
  },

  // ── TERMINAL CHROME ───────────────────────
  // Scanline header strip (decorative top bar)
  terminalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
    marginBottom: 20,
  },
  terminalHeaderText: {
    fontFamily: MONO,
    fontSize: fonts.xs,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  // ">" prompt prefix
  promptPrefix: {
    fontFamily: MONO,
    fontSize: fonts.base,
    color: colors.primary,
    marginRight: 8,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  // Inline tag  e.g.  [WARNING]
  tag: {
    fontFamily: MONO,
    fontSize: fonts.xs,
    letterSpacing: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    overflow: 'hidden',         // needed for borderRadius on Android text
  },
  tagPrimary: {
    color: colors.textInverse,
    backgroundColor: colors.primary,
  },
  tagWarning: {
    color: colors.textInverse,
    backgroundColor: colors.warning,
  },
  tagDanger: {
    color: '#fff',
    backgroundColor: colors.danger,
  },
  tagMuted: {
    color: colors.textMuted,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },

  // ── LAYOUT HELPERS ────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacerSm: { height: 8  },
  spacerMd: { height: 16 },
  spacerLg: { height: 32 },
  flex1:    { flex: 1    },
  textCenter: { textAlign: 'center' },
});

export default styles;
