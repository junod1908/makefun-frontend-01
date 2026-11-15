const BASE = 'https://make.fun';
const cache = new Map();

export async function getJSON(path) {
  const url = new URL(path, BASE).href;
  const previous = cache.get(url);
  const now = Date.now();
  if (previous && now - previous.minute < 45_000) return previous.data;
  const headers = new Headers({ Accept: 'application/json' });
  if (previous?.etag) headers.set('If-None-Match', previous.etag);
  const response = await fetch(url, { headers });
  if (response.status === 304 && previous) {
    cache.set(url, { ...previous, minute: now });
    return previous.data;
  }
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const data = await response.json();
  cache.set(url, { etag: response.headers.get('ETag'), data, minute: now });
  return data;
}
export const listCompetitions = () => getJSON('/api/competitions?status=open');
export const getCompetition = slug => getJSON(`/api/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = slug => getJSON(`/api/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = handle => getJSON(`/api/profiles/${encodeURIComponent(handle)}`);
