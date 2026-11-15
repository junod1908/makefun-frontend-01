import { getLeaderboard } from './api.js';
import { esc, money } from './format.js';
const value = (row, ...keys) => keys.map(key => row?.[key]).find(v => v !== undefined && v !== null);
export async function renderLeaderboard(root, slug) {
  const response = await getLeaderboard(slug);
  const rows = Array.isArray(response?.entries) ? response.entries : (Array.isArray(response) ? response : (response?.rows || response?.leaderboard || response?.data || []));
  const title = response?.title || response?.competition?.title || 'Leaderboard';
  const rankColumn = response?.columns?.find(column => column?.key === response?.rank_key);
  const rankIsMicro = typeof rankColumn?.source === 'string' && /\bmicro\b/i.test(rankColumn.source);
  root.innerHTML = `<section class="page-head"><span class="eyebrow">Live standings</span><h1>${esc(title)} leaderboard</h1><p class="intro">${rows.length} ${rows.length === 1 ? 'entrant' : 'entrants'} ranked</p><a class="text-link" href="#/bounty/${encodeURIComponent(slug)}">← Back to bounty</a></section><section class="panel leaderboard-wrap"><table class="leaderboard"><thead><tr><th>Rank</th><th>Entrant</th><th>Score / rate</th><th>Entries / title</th></tr></thead><tbody>${rows.length ? rows.map((row, index) => {
    const handle = value(row, 'handle', 'username', 'entrantHandle', 'profileHandle', 'user') || 'anonymous';
    const entrant = typeof handle === 'object' ? value(handle, 'handle', 'username', 'name') || 'anonymous' : handle;
    const rank = value(row, 'rank', 'place', 'position') ?? index + 1;
    let score = response?.rank_key ? row?.values?.[response.rank_key] : undefined;
    if (score == null) score = value(row?.values, 'score');
    if (score == null) score = value(row, 'score');
    const numericScore = Number(score);
    const scoreDisplay = score == null ? '—' : (Number.isFinite(numericScore) ? (rankIsMicro ? (numericScore / 1000000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') : String(numericScore)) : String(score));
    const entries = value(row, 'title', 'entries', 'submissionCount', 'entryCount', 'name');
    return `<tr><td>${esc(rank)}</td><td><a class="text-link" href="#/profile/${encodeURIComponent(String(entrant).replace(/^@/, ''))}">@${esc(String(entrant).replace(/^@/, ''))}</a></td><td>${esc(scoreDisplay)}</td><td>${entries == null ? '—' : esc(entries)}</td></tr>`;
  }).join('') : '<tr><td colspan="4">No leaderboard entries yet.</td></tr>'}</tbody></table></section>`;
}
