// API: /api/v1/owner/team-managers
// Статистика и список менеджеров (страница "Команда" → "Менеджеры")

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const parseDateParam = (value) => {
  if (!value) return null;
  const str = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const date = new Date(`${str}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const resolvePeriod = ({ period, start, end }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'custom') {
    const startDate = parseDateParam(start);
    const endDate = parseDateParam(end);
    if (startDate && endDate) {
      return startDate <= endDate
        ? { startDate, endDate }
        : { startDate: endDate, endDate: startDate };
    }
  }

  const endDate = addDays(today, 0);
  let startDate = addDays(today, -29);

  switch (period) {
    case '7days':
      startDate = addDays(today, -6);
      break;
    case '30days':
      startDate = addDays(today, -29);
      break;
    case 'quarter':
      startDate = addDays(today, -89);
      break;
    default:
      startDate = addDays(today, -29);
  }

  return { startDate, endDate };
};

export default async function handler(req, res) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  if (!pair) return res.status(401).json({ error: 'Unauthorized' });

  let payload;
  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { companyId, period = '30days', start, end, search } = req.query || {};
  const body = req.body || {};

  const targetCompanyId = companyId || body.companyId;
  if (!targetCompanyId) {
    return res.status(400).json({ error: 'companyId is required' });
  }

  const resolved = resolvePeriod({ period, start, end });
  const startDateStr = formatDate(resolved.startDate);
  const endDateStr = formatDate(resolved.endDate);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const roleRes = await pool.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [payload.sub, targetCompanyId]
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'DELETE') {
      const userId = body.userId;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      await pool.query(
        `
        DELETE FROM user_company_roles
        WHERE company_id = $1
          AND user_id = $2
          AND role IN ('manager', 'org_department')
        `,
        [targetCompanyId, userId]
      );

      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const searchText = String(search || '').trim();
    const hasSearch = searchText.length > 0;

    const [managersCountRes, salesTotalsRes, managersRes] = await Promise.all([
      pool.query(
        `
        SELECT COUNT(*)::int AS managers_count
        FROM user_company_roles ucr
        WHERE ucr.company_id = $1
          AND ucr.role IN ('manager', 'org_department')
        `,
        [targetCompanyId]
      ),
      pool.query(
        `
        SELECT
          COUNT(tg.id)::int AS people,
          COALESCE(SUM(tg.cost_cents), 0)::bigint AS revenue_cents
        FROM tour_guests tg
        LEFT JOIN tour_guests primary_tg ON primary_tg.id = tg.primary_id
        JOIN tours t ON t.id = tg.tour_id
        JOIN user_company_roles ucr
          ON ucr.user_id = COALESCE(tg.admin_id, primary_tg.admin_id)
         AND ucr.company_id = $1
         AND ucr.role IN ('manager', 'org_department')
        WHERE t.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND tg.created_at::date >= $2
          AND tg.created_at::date <= $3
        `,
        [targetCompanyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        WITH managers AS (
          SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone
          FROM user_company_roles ucr
          JOIN users u ON u.id = ucr.user_id
          WHERE ucr.company_id = $1
            AND ucr.role IN ('manager', 'org_department')
        ),
        period_sales AS (
          SELECT
            COALESCE(tg.admin_id, primary_tg.admin_id) AS staff_id,
            COUNT(tg.id)::int AS people,
            COALESCE(SUM(tg.cost_cents), 0)::bigint AS revenue_cents
          FROM tour_guests tg
          LEFT JOIN tour_guests primary_tg ON primary_tg.id = tg.primary_id
          JOIN tours t ON t.id = tg.tour_id
          WHERE t.company_id = $1
            AND t.status NOT IN ('draft', 'canceled')
            AND tg.created_at::date >= $2
            AND tg.created_at::date <= $3
            AND COALESCE(tg.admin_id, primary_tg.admin_id) IS NOT NULL
          GROUP BY COALESCE(tg.admin_id, primary_tg.admin_id)
        )
        SELECT
          m.id,
          m.first_name,
          m.last_name,
          m.email,
          m.phone,
          COALESCE(ps.people, 0)::int AS sales_people,
          COALESCE(ps.revenue_cents, 0)::bigint AS revenue_cents
        FROM managers m
        LEFT JOIN period_sales ps ON ps.staff_id = m.id
        WHERE (
          $4::boolean = false
          OR (
            COALESCE(m.first_name, '') ILIKE ('%' || $5 || '%')
            OR COALESCE(m.last_name, '') ILIKE ('%' || $5 || '%')
            OR (COALESCE(m.first_name, '') || ' ' || COALESCE(m.last_name, '')) ILIKE ('%' || $5 || '%')
            OR COALESCE(m.email, '') ILIKE ('%' || $5 || '%')
            OR COALESCE(m.phone, '') ILIKE ('%' || $5 || '%')
          )
        )
        ORDER BY sales_people DESC, revenue_cents DESC, m.last_name NULLS LAST, m.first_name NULLS LAST, m.email ASC
        `,
        [targetCompanyId, startDateStr, endDateStr, hasSearch, searchText]
      ),
    ]);

    const managersCount = Number(managersCountRes.rows[0]?.managers_count || 0);
    const salesPeople = Number(salesTotalsRes.rows[0]?.people || 0);
    const salesRevenueCents = Number(salesTotalsRes.rows[0]?.revenue_cents || 0);

    const managers = (managersRes.rows || []).map((row) => ({
      id: row.id,
      firstName: row.first_name || null,
      lastName: row.last_name || null,
      email: row.email || null,
      phone: row.phone || null,
      salesPeople: Number(row.sales_people || 0),
      revenue: Number(row.revenue_cents || 0) / 100,
    }));

    return res.status(200).json({
      period: {
        id: period,
        start: startDateStr,
        end: endDateStr,
      },
      stats: {
        managersCount,
        leads: 0,
        conversion: 0,
        sales: {
          people: salesPeople,
          revenue: salesRevenueCents / 100,
        },
      },
      managers,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Team managers error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end();
  }
}

