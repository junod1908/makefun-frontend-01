import { getCompetition } from './api.js';
import { esc, money, shortDate, timeLeft } from './format.js';
const value = (item, ...keys) => keys.map(key => item?.[key]).find(v => v !== undefined && v !== null);
const asParagraphs = text => String(text ?? '').split(/\n\s*\n/).map(block => block.trim()).filter(Boolean).map(block => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`).join('');
export async function renderBounty(root, slug) {
  const response = await getCompetition(slug);
  const item = response?.competition || response?.data || response;
  const title = value(item, 'title', 'name') || 'Bounty';
  const deadline = value(item, 'deadline', 'deadlineAt', 'endsAt', 'endDate');
  const opens = value(item, 'opensAt', 'startDate', 'startsAt');
  const fee = Number(value(item, 'entryFeeUsd', 'entryFee') ?? 0);
  const entries = value(item, 'submissionCount', 'entriesCount') ?? 0;
  const rewardsNow = Array.isArray(item?.rewardsNow) ? item.rewardsNow : [];
  const rewardRows = rewardsNow.length ? rewardsNow : (item?.rewards && typeof item.rewards === 'object' ? Object.entries(item.rewards).map(([place, amountUsd]) => ({ place, amountUsd })) : []);
  const total = value(item, 'potUsd') ?? rewardRows.reduce((sum, r) => sum + Number(value(r, 'amountUsd', 'amount', 'rewardAmount') || 0), 0);
  const status = deadline && Date.parse(deadline) <= Date.now() ? 'Closed' : (value(item, 'status') || 'Open');
  root.innerHTML = `<section class="page-head"><span class="eyebrow">${esc(value(item, 'category') || 'Community bounty')}</span><h1>${esc(title)}</h1><p class="summary">${esc(value(item, 'summary', 'subtitle') || '')}</p></section><div class="facts"><div class="fact"><span>Live pot</span><strong>${money(total)}</strong></div><div class="fact"><span>Status</span><strong class="${status.toLowerCase() === 'closed' ? 'closed' : ''}">${esc(status)}</strong></div><div class="fact"><span>Entries</span><strong>${esc(entries)}</strong></div><div class="fact"><span>Opens</span><strong>${shortDate(opens)}</strong></div><div class="fact"><span>Deadline</span><strong>${shortDate(deadline)}${deadline && Date.parse(deadline) > Date.now() ? ` · ${esc(timeLeft(deadline))}` : ''}</strong></div>${fee > 0 ? `<div class="fact"><span>Entry fee</span><strong>${money(fee)}</strong></div>` : ''}</div>${rewardRows.length ? `<section class="panel"><h2>Rewards · ${money(total)} total</h2><table class="rewards"><thead><tr><th>Place</th><th>Amount</th></tr></thead><tbody>${rewardRows.map((reward, index) => `<tr><td>${esc(value(reward, 'place') ?? index + 1)}</td><td>${money(value(reward, 'amountUsd') ?? 0)}</td></tr>`).join('')}</tbody></table></section>` : ''}<section class="panel"><h2>About this bounty</h2><div class="description">${asParagraphs(value(item, 'description', 'details') || value(item, 'summary')) || '<p>Details have not been added yet.</p>'}</div></section><a class="text-link" href="#/bounty/${encodeURIComponent(slug)}/leaderboard">View leaderboard →</a>`;
}
