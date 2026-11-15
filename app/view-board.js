import { listCompetitions } from './api.js';
import { esc, money, timeLeft, shortDate } from './format.js';

const value = (item, ...keys) => keys.map(key => item?.[key]).find(v => v !== undefined && v !== null);
export async function renderBoard(root) {
  const result = await listCompetitions();
  const items = Array.isArray(result) ? result : (result?.items || result?.competitions || result?.data || []);
  const rows = items.map(item => ({ item, deadline: value(item, 'deadline', 'deadlineAt', 'endsAt', 'endDate') })).sort((a, b) => {
    const at = Date.parse(a.deadline), bt = Date.parse(b.deadline);
    const ac = !Number.isFinite(at) || at <= Date.now(), bc = !Number.isFinite(bt) || bt <= Date.now();
    return Number(ac) - Number(bc) || (ac ? 0 : at - bt);
  });
  root.innerHTML = `<section class="page-head"><span class="eyebrow">The make.fun board</span><h1>Build something. Win a bounty.</h1><p class="intro">Open challenges from the community, with live rewards and deadlines. Pick a project and make your mark.</p></section><div class="section-heading"><h2>Open bounties</h2><span class="count">${items.length} ${items.length === 1 ? 'challenge' : 'challenges'}</span></div>${rows.length ? `<div class="cards">${rows.map(({ item, deadline }) => {
    const slug = value(item, 'slug', 'id') || '';
    const title = value(item, 'title', 'name') || 'Untitled bounty';
    const pot = value(item, 'potUsd', 'rewardAmount') ?? 0;
    const fee = Number(value(item, 'entryFeeUsd', 'entryFee') ?? 0);
    const closed = !deadline || Date.parse(deadline) <= Date.now();
    return `<article class="card"><div class="card-top"><span class="category">${esc(value(item, 'category', 'tag') || 'Community')}</span><span class="pill ${closed ? 'closed' : ''}">${closed ? 'Closed' : esc(timeLeft(deadline))}</span></div><div class="pot">${money(pot)}</div><h2><a href="#/bounty/${encodeURIComponent(slug)}">${esc(title)}</a></h2><div class="meta">${fee > 0 ? `<span>Fee <strong>${money(fee)}</strong></span>` : ''}<span><strong>${esc(value(item, 'submissionCount', 'entriesCount') ?? 0)}</strong> entries</span><span>Deadline <strong>${shortDate(deadline)}</strong></span></div></article>`;
  }).join('')}</div>` : '<p class="empty">No open bounties right now. Check back soon.</p>'}`;
}
