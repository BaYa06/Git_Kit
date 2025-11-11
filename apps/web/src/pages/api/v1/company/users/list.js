// pages/api/v1/company/users/list.js
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const p = cookie.split('; ').find(c => c.startsWith('gidkit_token='));
  return p ? decodeURIComponent(p.split('=')[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ message: 'company_id required' });

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  try {
    jwt.verify(token, JWT_SECRET);
    const q = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.username, ucr.role
      FROM user_company_roles ucr
      JOIN users u ON u.id = ucr.user_id
      WHERE ucr.company_id = $1
      ORDER BY
        CASE ucr.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'manager' THEN 2 WHEN 'guide' THEN 3 ELSE 9 END,
        u.first_name NULLS LAST, u.last_name NULLS LAST;
    `;
    const { rows } = await pool.query(q, [company_id]);

    const group = { admins: [], managers: [], guides: [] };
    for (const r of rows) {
      const item = { id: r.id, name: [r.first_name, r.last_name].filter(Boolean).join(' ') || r.username || r.email, email: r.email, phone: r.phone, username: r.username };
      if (r.role === 'owner' || r.role === 'admin') group.admins.push(item);
      else if (r.role === 'manager' || r.role === 'org_department') group.managers.push(item);
      else if (r.role === 'guide') group.guides.push(item);
    }
    return res.status(200).json(group);
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }
}
