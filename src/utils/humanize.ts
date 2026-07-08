export function humanize(str: string): string {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
}
