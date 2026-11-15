import { getProfile } from './api.js';
import { esc, money, shortDate } from './format.js';
const value = (obj, ...keys) => keys.map(key => obj?.[key]).find(v => v !== undefined && v !== null);
function statsMarkup(record) {
  if (!record || typeof record !== 'object') return '';
  const stats = [
    ['competitions_entered', 'Entered'],
    ['competitions_placed', 'Placed'],
    ['competitions_won', 'Won'],
    ['podium_finishes', 'Podium finishes'],
    ['best_placement', 'Best placement'],
    ['prize_usd', 'Prize']
  ];
  return stats.filter(([key]) => record[key] !== undefined && record[key] !== null).map(([key, label]) => `<div class="stat"><strong>${key === 'prize_usd' ? money(record[key]) : esc(record[key])}</strong><span>${esc(label)}</span></div>`).join('');
}
export async function renderProfile(root, handle) {
  const response = await getProfile(handle);
  const profile = response?.profile || response?.data || response;
  const name = value(profile, 'display_name') || handle;
  const profileHandle = value(profile, 'handle') || handle;
  const rawAvatar = value(profile, 'image') || value(profile?.avatar, 'url');
  const avatar = rawAvatar?.startsWith('/') ? `https://make.fun${rawAvatar}` : rawAvatar;
  const bio = value(profile, 'bio') || '';
  const record = profile?.record;
  const recent = Array.isArray(profile?.solutions) ? profile.solutions : [];
  root.innerHTML = `<section class="page-head"><div class="profile-head">${avatar ? `<img class="avatar" src="${esc(avatar)}" crossorigin="anonymous" alt="${esc(name)} avatar">` : ''}<div><span class="eyebrow">Creator profile</span><h1>${esc(name)}</h1><p class="handle">@${esc(String(profileHandle).replace(/^@/, ''))}</p></div></div>${bio ? `<p class="bio">${esc(bio)}</p>` : ''}</section>${statsMarkup(record) ? `<section class="panel"><h2>Stats</h2><div class="stats">${statsMarkup(record)}</div></section>` : ''}<section class="panel"><h2>Recent entries</h2>${recent.length ? `<div class="cards">${recent.map(entry => {
    const title = value(entry, 'title') || 'Entry';
    const competition = entry?.competition || {};
    const competitionTitle = value(competition, 'title') || 'Competition';
    const competitionSlug = value(competition, 'slug');
    const url = competitionSlug ? `#/bounty/${encodeURIComponent(competitionSlug)}` : null;
    const placement = value(entry, 'placement');
    const score = value(entry?.score, 'display');
    const date = value(entry, 'entered_at');
    return `<article class="card"><div class="card-top"><span class="category">${esc(competitionTitle)}</span>${date ? `<span class="pill">${shortDate(date)}</span>` : ''}</div><h2>${url ? `<a class="text-link" href="${esc(url)}">${esc(title)}</a>` : esc(title)}</h2><p>${score != null ? `Score: ${esc(score)}` : ''}${placement != null ? `${score != null ? ' · ' : ''}Placement: ${esc(placement)}` : ''}</p></article>`;
  }).join('')}</div>` : '<p class="empty">No recent entries to show.</p>'}</section>`;
}
