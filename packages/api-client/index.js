const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

async function post(base, path, data) {
  const res = await fetch(base.replace(/\/$/, '') + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

module.exports = { post };
