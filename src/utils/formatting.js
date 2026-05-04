export function formatChanges(changes) {
  const entries = Object.entries(changes);
  if (entries.length === 0) return 'NO CHANGE';
  return entries
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k.toUpperCase()}`)
    .join('   ');
}
