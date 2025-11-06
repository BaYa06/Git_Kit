export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://git-kit-web.vercel.app';

export async function apiPost(path, data) {
  const res = await fetch(path, { // без BASE
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

