// API: /api/v1/owner/quality
// Возвращает агрегаты для страницы "Контроль качества"

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  if (!pair) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = decodeURIComponent(pair.split('=')[1]);
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { companyId } = req.query;
  if (!companyId) {
    return res.status(400).json({ message: 'companyId is required' });
  }

  const client = await pool.connect();
  try {
    // Проверка роли
    const roleRes = await client.query(
      'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
      [payload.sub, companyId]
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Все фидбеки по компании
    const feedbacksRes = await client.query(
      `SELECT tf.rating_guide, tf.rating_transport, tf.rating_tour
         FROM tour_feedbacks tf
         JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
        WHERE tfl.company_id = $1`,
      [companyId]
    );

    // Негативные отзывы (рейтинг 1 или 2 по любой категории)
    const negativesRes = await client.query(
      `SELECT 
         tf.tourist_name,
         tf.rating_guide,
         tf.rating_transport,
         tf.rating_tour,
         tf.guide_comment,
         tf.driver_comment,
         tf.tour_comment,
         tf.created_at,
         t.name AS tour_name,
         t.start_date
       FROM tour_feedbacks tf
       JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
       JOIN tours t ON t.id = tfl.tour_id
      WHERE tfl.company_id = $1
        AND (
          (tf.rating_guide IS NOT NULL AND tf.rating_guide <= 2) OR
          (tf.rating_transport IS NOT NULL AND tf.rating_transport <= 2) OR
          (tf.rating_tour IS NOT NULL AND tf.rating_tour <= 2)
        )
      ORDER BY tf.created_at DESC
      LIMIT 20`,
      [companyId]
    );

    // Тренды качества (последние 30 дней и предыдущие 30)
    const trendsCurrentRes = await client.query(
      `SELECT date_trunc('day', tf.created_at)::date AS day, AVG(tf.rating_tour) AS avg_rating
       FROM tour_feedbacks tf
       JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
      WHERE tfl.company_id = $1
        AND tf.created_at >= (CURRENT_DATE - INTERVAL '29 days')
      GROUP BY day
      ORDER BY day ASC`,
      [companyId]
    );

    const trendsPrevRes = await client.query(
      `SELECT date_trunc('day', tf.created_at)::date AS day, AVG(tf.rating_tour) AS avg_rating
       FROM tour_feedbacks tf
       JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
      WHERE tfl.company_id = $1
        AND tf.created_at >= (CURRENT_DATE - INTERVAL '59 days')
        AND tf.created_at < (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY day
      ORDER BY day ASC`,
      [companyId]
    );

    const rows = feedbacksRes.rows || [];
    let ratingsSum = 0;
    let ratingsCount = 0;
    let negative = 0;
    let complaints = 0;

    let promoters = 0;
    let detractors = 0;

    const guides = { sum: 0, count: 0 };
    const transport = { sum: 0, count: 0 };
    const tour = { sum: 0, count: 0 };
    const histGuide = [0, 0, 0, 0, 0];
    const histTransport = [0, 0, 0, 0, 0];
    const histTour = [0, 0, 0, 0, 0];

    rows.forEach((r) => {
      const values = [r.rating_guide, r.rating_transport, r.rating_tour].filter(
        (v) => Number.isFinite(v) && v > 0
      );
      values.forEach((v) => {
        ratingsSum += Number(v);
        ratingsCount += 1;
        if (v <= 2) negative += 1;
        if (v <= 2) complaints += 1;
      });

      if (Number.isFinite(r.rating_guide)) {
        guides.sum += Number(r.rating_guide);
        guides.count += 1;
        const idx = Math.min(4, Math.max(0, Number(r.rating_guide) - 1));
        histGuide[idx] += 1;
      }
      if (Number.isFinite(r.rating_transport)) {
        transport.sum += Number(r.rating_transport);
        transport.count += 1;
        const idx = Math.min(4, Math.max(0, Number(r.rating_transport) - 1));
        histTransport[idx] += 1;
      }
      if (Number.isFinite(r.rating_tour)) {
        tour.sum += Number(r.rating_tour);
        tour.count += 1;
        const idx = Math.min(4, Math.max(0, Number(r.rating_tour) - 1));
        histTour[idx] += 1;
        if (r.rating_tour >= 4) promoters += 1;
        else if (r.rating_tour <= 2) detractors += 1;
      }
    });

    const avgAll = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    const avgGuide = guides.count > 0 ? guides.sum / guides.count : null;
    const avgTransport = transport.count > 0 ? transport.sum / transport.count : null;
    const avgTour = tour.count > 0 ? tour.sum / tour.count : null;

    const totalForNps = tour.count;
    const nps =
      totalForNps > 0 ? Math.round(((promoters - detractors) / totalForNps) * 100) : 0;

    const negatives = (negativesRes.rows || []).map((r) => {
      const scores = [
        { key: 'guide', val: Number(r.rating_guide) },
        { key: 'transport', val: Number(r.rating_transport) },
        { key: 'tour', val: Number(r.rating_tour) },
      ].filter((x) => Number.isFinite(x.val) && x.val > 0);

      const worst = scores.sort((a, b) => a.val - b.val)[0] || { key: 'guide', val: null };
      const tag =
        worst.key === 'guide' ? 'Гид' : worst.key === 'transport' ? 'Транспорт' : 'Тур';
      const comment =
        worst.key === 'guide'
          ? r.guide_comment
          : worst.key === 'transport'
          ? r.driver_comment
          : r.tour_comment;

      const tourLabel = r.tour_name
        ? `${r.tour_name}${r.start_date ? `, ${new Date(r.start_date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}` : ''}`
        : '';

      return {
        name: r.tourist_name || 'Гость',
        tag,
        rating: worst.val,
        text: comment || '—',
        tour: tourLabel,
        created_at: r.created_at,
      };
    });

    const trends = {
      current: (trendsCurrentRes.rows || []).map((r) => ({
        date: r.day,
        value: Number(r.avg_rating || 0),
      })),
      prev: (trendsPrevRes.rows || []).map((r) => ({
        date: r.day,
        value: Number(r.avg_rating || 0),
      })),
    };

    // Агрегация по объектам
    const [guidesAgg, transportAgg, toursAgg, hotelsAgg] = await Promise.all([
      client.query(
        `SELECT g.id, g.full_name AS name,
                AVG(tf.rating_guide) AS rating,
                COUNT(tf.rating_guide) AS reviews,
                SUM(CASE WHEN tf.rating_guide <= 2 THEN 1 ELSE 0 END) AS negatives
           FROM tour_feedbacks tf
           JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
           JOIN guides g ON g.id = tfl.guide_id
          WHERE tfl.company_id = $1
            AND tf.rating_guide IS NOT NULL
          GROUP BY g.id, g.full_name`,
        [companyId]
      ),
      client.query(
        `SELECT d.id, d.full_name AS name,
                AVG(tf.rating_transport) AS rating,
                COUNT(tf.rating_transport) AS reviews,
                SUM(CASE WHEN tf.rating_transport <= 2 THEN 1 ELSE 0 END) AS negatives
           FROM tour_feedbacks tf
           JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
           JOIN drivers d ON d.id = tfl.driver_id
          WHERE tfl.company_id = $1
            AND tf.rating_transport IS NOT NULL
          GROUP BY d.id, d.full_name`,
        [companyId]
      ),
      client.query(
        `SELECT t.id, t.name AS name,
                AVG(tf.rating_tour) AS rating,
                COUNT(tf.rating_tour) AS reviews,
                SUM(CASE WHEN tf.rating_tour <= 2 THEN 1 ELSE 0 END) AS negatives
           FROM tour_feedbacks tf
           JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
           JOIN tours t ON t.id = tfl.tour_id
          WHERE tfl.company_id = $1
            AND tf.rating_tour IS NOT NULL
          GROUP BY t.id, t.name`,
        [companyId]
      ),
      client.query(
        `SELECT h.id, h.name AS name,
                AVG(tf.rating_tour) AS rating,
                COUNT(tf.rating_tour) AS reviews,
                SUM(CASE WHEN tf.rating_tour <= 2 THEN 1 ELSE 0 END) AS negatives
           FROM tour_feedbacks tf
           JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
           JOIN hotels h ON h.id = tfl.hotel_id
          WHERE tfl.company_id = $1
            AND tf.rating_tour IS NOT NULL
          GROUP BY h.id, h.name`,
        [companyId]
      ),
    ]);

    return res.status(200).json({
      stats: {
        avgAll,
        reviews: rows.length,
        negative,
        complaints,
        nps,
      },
      breakdown: {
        guide: avgGuide,
        transport: avgTransport,
        tour: avgTour,
        hotel: null,
        hist: {
          guide: histGuide,
          transport: histTransport,
          tour: histTour,
          hotel: [0, 0, 0, 0, 0],
        },
      },
      negatives,
      trends,
      objects: {
        guides: guidesAgg.rows || [],
        transport: transportAgg.rows || [],
        hotels: hotelsAgg.rows || [],
        tours: toursAgg.rows || [],
      },
    });
  } catch (e) {
    if (isDev) console.error('quality api error', e);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
}
