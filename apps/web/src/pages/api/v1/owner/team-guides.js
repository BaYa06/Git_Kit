// API: /api/v1/owner/team-guides
// Данные для страницы "Команда" → "Гиды"

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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  if (!companyId) return res.status(400).json({ error: 'companyId is required' });

  const resolved = resolvePeriod({ period, start, end });
  const startDateStr = formatDate(resolved.startDate);
  const endDateStr = formatDate(resolved.endDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const searchText = String(search || '').trim();
  const hasSearch = searchText.length > 0;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const roleRes = await pool.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [payload.sub, companyId]
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [guidesCountsRes, toursPeriodRes, ratingRes, guidesRes] = await Promise.all([
      pool.query(
        `
        SELECT
          COUNT(*)::int AS total_guides,
          COUNT(*) FILTER (WHERE COALESCE(is_active, true) = true)::int AS active_guides
        FROM guides
        WHERE company_id = $1
        `,
        [companyId]
      ),
      pool.query(
        `
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
            t.main_guide_id IS NOT NULL
            OR tc.guide_id IS NOT NULL
          )
        `,
        [companyId, startDateStr, endDateStr]
      ),
      pool.query(
        `
        SELECT
          COUNT(f.rating_guide)::int AS ratings_count,
          AVG(f.rating_guide) AS avg_rating,
          COUNT(*) FILTER (WHERE f.rating_guide <= 2)::int AS complaints
        FROM tour_feedbacks f
        JOIN tour_feedback_links l ON l.id = f.feedback_link_id
        JOIN tours t ON t.id = l.tour_id
        WHERE l.company_id = $1
          AND t.status NOT IN ('draft', 'canceled')
          AND f.rating_guide IS NOT NULL
        `,
        [companyId]
      ),
      pool.query(
        `
        SELECT
          g.id,
          g.full_name,
          g.phone,
          g.telegram,
          g.email,
          g.languages,
          g.logo_url,
          COALESCE(g.is_active, true) AS is_active,
          COALESCE(ts.tours_count, 0)::int AS tours_count,
          fs.avg_rating AS avg_rating,
          COALESCE(fs.complaints, 0)::int AS complaints,
          nt.tour_id AS next_tour_id,
          nt.tour_name AS next_tour_name,
          nt.tour_date AS next_tour_date
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
            AND (
              l.guide_id = g.id
              OR (l.guide_id IS NULL AND t.main_guide_id = g.id)
            )
        ) fs ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            t.id AS tour_id,
            t.name AS tour_name,
            t.start_date AS tour_date
          FROM tours t
          LEFT JOIN tour_components tc
            ON tc.tour_id = t.id
           AND tc.type = 'guide'
          WHERE t.company_id = $1
            AND t.status NOT IN ('draft', 'canceled')
            AND t.start_date IS NOT NULL
            AND t.start_date >= $4
            AND (
              t.main_guide_id = g.id
              OR tc.guide_id = g.id
            )
          ORDER BY t.start_date ASC
          LIMIT 1
        ) nt ON TRUE
        WHERE g.company_id = $1
          AND (
            $5::boolean = false
            OR (
              COALESCE(g.full_name, '') ILIKE ('%' || $6 || '%')
              OR COALESCE(g.phone, '') ILIKE ('%' || $6 || '%')
              OR COALESCE(g.email, '') ILIKE ('%' || $6 || '%')
              OR COALESCE(g.telegram, '') ILIKE ('%' || $6 || '%')
            )
          )
        ORDER BY COALESCE(g.is_active, true) DESC, ts.tours_count DESC, fs.avg_rating DESC NULLS LAST, g.full_name NULLS LAST
        `,
        [companyId, startDateStr, endDateStr, todayStr, hasSearch, searchText]
      ),
    ]);

    const totalGuides = Number(guidesCountsRes.rows[0]?.total_guides || 0);
    const activeGuides = Number(guidesCountsRes.rows[0]?.active_guides || 0);
    const toursInPeriod = Number(toursPeriodRes.rows[0]?.tours_count || 0);

    const ratingsCount = Number(ratingRes.rows[0]?.ratings_count || 0);
    const avgRatingRaw = ratingRes.rows[0]?.avg_rating;
    const avgRating = ratingsCount > 0 && avgRatingRaw !== null ? Number(avgRatingRaw) : null;
    const complaints = Number(ratingRes.rows[0]?.complaints || 0);

    const guides = (guidesRes.rows || []).map((row) => ({
      id: row.id,
      fullName: row.full_name || null,
      phone: row.phone || null,
      telegram: row.telegram || null,
      email: row.email || null,
      languages: Array.isArray(row.languages) ? row.languages : [],
      logoUrl: row.logo_url || null,
      isActive: Boolean(row.is_active),
      toursCount: Number(row.tours_count || 0),
      avgRating: row.avg_rating === null || row.avg_rating === undefined ? null : Number(row.avg_rating),
      complaints: Number(row.complaints || 0),
      nextTour: row.next_tour_id
        ? {
            id: row.next_tour_id,
            name: row.next_tour_name || null,
            date:
              row.next_tour_date instanceof Date
                ? formatDate(row.next_tour_date)
                : row.next_tour_date
                  ? String(row.next_tour_date).slice(0, 10)
                  : null,
          }
        : null,
    }));

    const topRated = guides
      .filter((g) => typeof g.avgRating === 'number' && !Number.isNaN(g.avgRating))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 3)
      .map((g) => ({
        id: g.id,
        fullName: g.fullName,
        toursCount: g.toursCount,
        avgRating: g.avgRating,
      }));

    const needsAttention = guides
      .filter((g) => typeof g.avgRating === 'number' && !Number.isNaN(g.avgRating) && g.avgRating < 4)
      .sort((a, b) => a.avgRating - b.avgRating)
      .map((g) => ({
        id: g.id,
        fullName: g.fullName,
        avgRating: g.avgRating,
        complaints: g.complaints,
        isActive: g.isActive,
      }));

    return res.status(200).json({
      period: {
        id: period,
        start: startDateStr,
        end: endDateStr,
      },
      stats: {
        totalGuides,
        activeGuides,
        toursInPeriod,
        avgGuideRating: avgRating,
        ratingsCount,
        complaints,
      },
      guides,
      topRated,
      needsAttention,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Team guides error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await pool.end();
  }
}

