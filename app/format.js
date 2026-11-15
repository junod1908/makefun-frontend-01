export function money(n) {
  const value = Number(typeof n === 'string' ? n.trim() : n);
  if (!Number.isFinite(value)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value > 0 && value < 1 ? 2 : 0, minimumFractionDigits: value > 0 && value < 1 ? 2 : 0 }).format(value);
}
export function timeLeft(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms) || ms <= Date.now()) return 'Closed';
  const hours = Math.floor((ms - Date.now()) / 3600000);
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return days ? `${days}d ${rest}h left` : `${Math.max(1, hours)}h left`;
}
export function shortDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
