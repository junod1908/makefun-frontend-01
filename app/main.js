import { renderBoard } from './view-board.js';
import { renderBounty } from './view-bounty.js';

const outlet = document.querySelector('#app');
const search = document.querySelector('#profile-search');
search.addEventListener('submit', event => {
  event.preventDefault();
  const handle = new FormData(search).get('handle')?.trim();
  if (handle) location.hash = `/profile/${encodeURIComponent(handle.replace(/^@/, ''))}`;
});

function routeFromHash() {
  let route = decodeURIComponent(location.hash.replace(/^#/, '') || '/');
  if (!route.startsWith('/')) route = `/${route}`;
  const parts = route.split('/').filter(Boolean);
  if (!parts.length) return { type: 'board' };
  if (parts[0] === 'bounty' && parts[1]) return { type: parts[2] === 'leaderboard' ? 'leaderboard' : 'bounty', slug: parts[1] };
  if (parts[0] === 'profile' && parts[1]) return { type: 'profile', handle: parts[1] };
  return { type: 'not-found' };
}

async function navigate() {
  const route = routeFromHash();
  window.__shotReady = false;
  outlet.innerHTML = '<p class="loading">Loading…</p>';
  try {
    if (route.type === 'board') await renderBoard(outlet);
    else if (route.type === 'bounty') await renderBounty(outlet, route.slug);
    else if (route.type === 'leaderboard') {
      const view = await import('./view-leaderboard.js');
      await view.renderLeaderboard(outlet, route.slug);
    } else if (route.type === 'profile') {
      const view = await import('./view-profile.js');
      await view.renderProfile(outlet, route.handle);
    } else outlet.innerHTML = '<section class="page-head"><span class="eyebrow">404</span><h1>Page not found</h1><a class="text-link" href="#/">Back to the board</a></section>';
  } catch (error) {
    outlet.innerHTML = `<section class="page-head"><span class="eyebrow">Something went wrong</span><h1>Couldn’t load this page</h1><p class="error">${escapeText(error.message)}</p><a class="text-link" href="#/">Back to the board</a></section>`;
  } finally {
    window.__shotReady = true;
  }
}
function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
window.addEventListener('hashchange', navigate);
await navigate();
