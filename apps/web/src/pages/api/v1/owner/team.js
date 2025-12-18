// API: /api/v1/owner/team
// Возвращает эффективность команды (админы компании + продажи за текущий месяц)

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  if (!pair) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret_change_me'
    );

    const { companyId } = req.query || {};
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Проверяем роль пользователя
    const roleRes = await pool.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [payload.sub, companyId]
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      await pool.end();
      return res.status(403).json({ error: 'Access denied' });
    }

    // Диапазон текущего месяца по start_date туров
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    const teamRes = await pool.query(
      `
      WITH month_sales AS (
        SELECT
          COALESCE(tg.admin_id, primary_tg.admin_id) AS admin_id,
          COALESCE(SUM(tg.cost_cents), 0) AS sales_cents
        FROM tour_guests tg
        LEFT JOIN tour_guests primary_tg ON primary_tg.id = tg.primary_id
        JOIN tours t ON t.id = tg.tour_id
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status NOT IN ('draft', 'canceled')
          AND COALESCE(tg.admin_id, primary_tg.admin_id) IS NOT NULL
        GROUP BY COALESCE(tg.admin_id, primary_tg.admin_id)
      )
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(ms.sales_cents, 0) AS sales_cents
      FROM user_company_roles ucr
      JOIN users u ON u.id = ucr.user_id
      LEFT JOIN month_sales ms ON ms.admin_id = u.id
      WHERE ucr.company_id = $1
        AND ucr.role = 'admin'
      ORDER BY sales_cents DESC, u.last_name NULLS LAST, u.first_name NULLS LAST, u.email ASC
      `,
      [companyId, startDateStr, endDateStr]
    );

    await pool.end();

    const members = (teamRes.rows || []).map((row) => ({
      id: row.id,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      email: row.email || null,
      sales_cents: Number(row.sales_cents) || 0,
    }));

    return res.status(200).json({
      period: { start: startDateStr, end: endDateStr },
      members,
    });
  } catch (error) {
    console.error('Owner team error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
