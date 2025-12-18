// API: /api/v1/owner/team-overview
// Статистика для страницы "Команда" (вкладка "Все")

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
  // ожидаем YYYY-MM-DD
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
    // Пока нет UI для кастомного периода — используем дефолт 30 дней
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

    const { companyId, period = '30days', start, end } = req.query || {};
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const resolved = resolvePeriod({ period, start, end });
    if (!resolved) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    const startDateStr = formatDate(resolved.startDate);
    const endDateStr = formatDate(resolved.endDate);
    const periodDays =
      Math.round(
        (resolved.endDate.getTime() - resolved.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const prevStartDate = addDays(resolved.startDate, -periodDays);
    const prevEndDate = addDays(resolved.startDate, -1);
    const prevStartDateStr = formatDate(prevStartDate);
    const prevEndDateStr = formatDate(prevEndDate);

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

    const [
      staffCountsRes,
      guidesCountRes,
      salesRes,
      feedbackRes,
      salesSeriesRes,
      prevSalesSeriesRes,
      topManagersRes,
      topGuidesRes,
    ] = await Promise.all([
      pool.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
          COUNT(*) FILTER (WHERE role = 'manager')::int AS managers
        FROM user_company_roles
        WHERE company_id = $1
          AND role IN ('admin', 'manager')
        `,
        [companyId]
      ),
      pool.query(
        `
        SELECT COUNT(*)::int AS guides
        FROM guides
        WHERE company_id = $1
          AND COALESCE(is_active, true) = true
        `,
        [companyId]
      ),
      pool.query(
        `
        SELECT
          COUNT(tg.id)::int AS people,
          COALESCE(SUM(tg.cost_cents), 0)::bigint AS revenue_cents
        FROM tour_guests tg
        JOIN tours t ON t.id = tg.tour_id
        WHERE t.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND tg.created_at::date >= $2
          AND tg.created_at::date <= $3
        `,
        [companyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        SELECT
          COUNT(tf.rating_tour)::int AS ratings_count,
          COALESCE(AVG(tf.rating_tour), 0) AS avg_rating,
          COUNT(*) FILTER (WHERE tf.rating_tour = 5)::int AS rating_5,
          COUNT(*) FILTER (WHERE tf.rating_tour = 4)::int AS rating_4,
          COUNT(*) FILTER (WHERE tf.rating_tour BETWEEN 1 AND 3)::int AS rating_1_3,
          COUNT(*) FILTER (WHERE tf.rating_tour <= 2)::int AS complaints
        FROM tour_feedbacks tf
        JOIN tour_feedback_links tfl ON tfl.id = tf.feedback_link_id
        JOIN tours t ON t.id = tfl.tour_id
        WHERE tfl.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND tf.rating_tour IS NOT NULL
          AND tf.created_at::date >= $2
          AND tf.created_at::date <= $3
        `,
        [companyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        SELECT
          tg.created_at::date AS day,
          COUNT(tg.id)::int AS people,
          COALESCE(SUM(tg.cost_cents), 0)::bigint AS revenue_cents
        FROM tour_guests tg
        JOIN tours t ON t.id = tg.tour_id
        WHERE t.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND tg.created_at::date >= $2
          AND tg.created_at::date <= $3
        GROUP BY day
        ORDER BY day ASC
        `,
        [companyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        SELECT
          tg.created_at::date AS day,
          COUNT(tg.id)::int AS people,
          COALESCE(SUM(tg.cost_cents), 0)::bigint AS revenue_cents
        FROM tour_guests tg
        JOIN tours t ON t.id = tg.tour_id
        WHERE t.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND tg.created_at::date >= $2
          AND tg.created_at::date <= $3
        GROUP BY day
        ORDER BY day ASC
        `,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),
      pool.query(
        `
        WITH period_sales AS (
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
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COALESCE(ps.people, 0)::int AS sales_people,
          COALESCE(ps.revenue_cents, 0)::bigint AS revenue_cents
        FROM user_company_roles ucr
        JOIN users u ON u.id = ucr.user_id
        LEFT JOIN period_sales ps ON ps.staff_id = u.id
        WHERE ucr.company_id = $1
          AND ucr.role IN ('admin', 'manager')
        ORDER BY sales_people DESC, revenue_cents DESC, u.last_name NULLS LAST, u.first_name NULLS LAST, u.email ASC
        LIMIT 10
        `,
        [companyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        SELECT
          g.id,
          g.full_name,
          g.phone,
          g.telegram,
          g.email,
          COALESCE(g.is_active, true) AS is_active,
          COALESCE(ts.tours_count, 0)::int AS tours_count,
          fs.avg_rating AS avg_rating,
          COALESCE(fs.complaints, 0)::int AS complaints
        FROM guides g
        LEFT JOIN LATERAL (
          SELECT COUNT(DISTINCT t.id)::int AS tours_count
          FROM tours t
          LEFT JOIN tour_components tc
            ON tc.tour_id = t.id
           AND tc.type = 'guide'
          WHERE t.company_id = $1
            AND t.status NOT IN ('draft', 'canceled')
            AND t.start_date >= $2
            AND t.start_date <= $3
            AND (
              t.main_guide_id = g.id
              OR tc.guide_id = g.id
            )
        ) ts ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            AVG(f.rating_guide) AS avg_rating,
            COUNT(*) FILTER (WHERE f.rating_guide <= 2)::int AS complaints
          FROM tour_feedbacks f
          JOIN tour_feedback_links l ON l.id = f.feedback_link_id
          JOIN tours t ON t.id = l.tour_id
          WHERE l.company_id = $1
            AND t.status NOT IN ('draft', 'canceled')
            AND f.rating_guide IS NOT NULL
            AND f.created_at::date >= $2
            AND f.created_at::date <= $3
            AND (
              l.guide_id = g.id
              OR (l.guide_id IS NULL AND t.main_guide_id = g.id)
            )
        ) fs ON TRUE
        WHERE g.company_id = $1
        ORDER BY tours_count DESC, avg_rating DESC NULLS LAST, g.full_name NULLS LAST
        LIMIT 10
        `,
        [companyId, startDateStr, endDateStr]
      ),
    ]);

    await pool.end();

    const admins = Number(staffCountsRes.rows[0]?.admins || 0);
    const managers = Number(staffCountsRes.rows[0]?.managers || 0);
    const guides = Number(guidesCountRes.rows[0]?.guides || 0);
    const employeesTotal = admins + managers + guides;

    const salesPeople = Number(salesRes.rows[0]?.people || 0);
    const salesRevenueCents = Number(salesRes.rows[0]?.revenue_cents || 0);

    const ratingsCount = Number(feedbackRes.rows[0]?.ratings_count || 0);
    const avgRatingRaw = Number(feedbackRes.rows[0]?.avg_rating || 0);
    const avgRating = ratingsCount > 0 ? avgRatingRaw : null;
    const rating5 = Number(feedbackRes.rows[0]?.rating_5 || 0);
    const rating4 = Number(feedbackRes.rows[0]?.rating_4 || 0);
    const rating13 = Number(feedbackRes.rows[0]?.rating_1_3 || 0);
    const complaints = Number(feedbackRes.rows[0]?.complaints || 0);

    const fillDailySeries = (rows, fromDate, toDate) => {
      const totals = (rows || []).reduce((acc, row) => {
        const key = row.day instanceof Date ? formatDate(row.day) : String(row.day).slice(0, 10);
        acc[key] = {
          people: Number(row.people || 0),
          revenue: Number(row.revenue_cents || 0) / 100,
        };
        return acc;
      }, {});

      const out = [];
      let cursor = new Date(fromDate);
      cursor.setHours(0, 0, 0, 0);
      const endCursor = new Date(toDate);
      endCursor.setHours(0, 0, 0, 0);

      while (cursor <= endCursor) {
        const key = formatDate(cursor);
        const val = totals[key] || { people: 0, revenue: 0 };
        out.push({ date: key, people: val.people, revenue: val.revenue });
        cursor = addDays(cursor, 1);
      }

      return out;
    };

    const series = fillDailySeries(
      salesSeriesRes.rows || [],
      resolved.startDate,
      resolved.endDate
    );
    const prevSeries = fillDailySeries(
      prevSalesSeriesRes.rows || [],
      prevStartDate,
      prevEndDate
    );

    const topManagers = (topManagersRes.rows || []).map((row) => ({
      id: row.id,
      firstName: row.first_name || null,
      lastName: row.last_name || null,
      email: row.email || null,
      salesPeople: Number(row.sales_people || 0),
      revenue: Number(row.revenue_cents || 0) / 100,
    }));

    const topGuides = (topGuidesRes.rows || []).map((row) => ({
      id: row.id,
      fullName: row.full_name || null,
      phone: row.phone || null,
      telegram: row.telegram || null,
      email: row.email || null,
      isActive: Boolean(row.is_active),
      toursCount: Number(row.tours_count || 0),
      avgRating: row.avg_rating === null || row.avg_rating === undefined ? null : Number(row.avg_rating),
      complaints: Number(row.complaints || 0),
    }));

    return res.status(200).json({
      period: {
        id: period,
        start: startDateStr,
        end: endDateStr,
        prevStart: prevStartDateStr,
        prevEnd: prevEndDateStr,
        days: periodDays,
      },
      employees: {
        total: employeesTotal,
        admins,
        managers,
        guides,
      },
      sales: {
        people: salesPeople,
        revenue: salesRevenueCents / 100,
        series,
        prevSeries,
      },
      service: {
        avgRating,
        ratingsCount,
        breakdown: {
          rating5,
          rating4,
          rating13,
        },
        complaints,
        unresolved: 0,
      },
      topEfficiency: {
        managers: topManagers,
        guides: topGuides,
      },
    });
  } catch (error) {
    console.error('Team overview error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
