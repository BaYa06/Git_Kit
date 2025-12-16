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
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');

    const { companyId } = req.query || {};
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Проверяем роль
    const roleRes = await pool.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [payload.sub, companyId]
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      await pool.end();
      return res.status(403).json({ error: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 7);

    const startStr = today.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const toursRes = await pool.query(
      `
      SELECT
        t.id,
        t.name,
        t.start_date,
        TO_CHAR(t.start_date, 'YYYY-MM-DD') AS start_date_str,
        t.status,
        t.tourists_count,
        COALESCE(tc.total_components, 0) AS total_components,
        COALESCE(tc.filled_components, 0) AS filled_components,
        COALESCE(tc.require_guide, false) AS require_guide,
        COALESCE(tc.require_hotel, false) AS require_hotel,
        COALESCE(tc.require_driver, false) AS require_driver,
        COALESCE(tc.has_guide, false) AS has_guide,
        COALESCE(tc.has_hotel, false) AS has_hotel,
        COALESCE(tc.has_driver, false) AS has_driver,
        COALESCE(g.stats_signed, 0) AS signed_count,
        COALESCE(g.stats_paid, 0) AS paid_count,
        COALESCE(g.total_cost, 0) AS total_cost,
        COALESCE(g.total_prepay, 0) AS total_prepay
      FROM tours t
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total_components,
          COUNT(*) FILTER (
            WHERE (guide_id IS NOT NULL OR hotel_id IS NOT NULL OR driver_id IS NOT NULL OR custom IS NOT NULL)
          ) AS filled_components,
          BOOL_OR(type = 'guide') AS require_guide,
          BOOL_OR(type = 'hotel') AS require_hotel,
          BOOL_OR(type = 'transport') AS require_driver,
          BOOL_OR(type = 'guide' AND (guide_id IS NOT NULL OR custom IS NOT NULL)) AS has_guide,
          BOOL_OR(type = 'hotel' AND (hotel_id IS NOT NULL OR custom IS NOT NULL)) AS has_hotel,
          BOOL_OR(type = 'transport' AND (driver_id IS NOT NULL OR custom IS NOT NULL)) AS has_driver
        FROM tour_components
        WHERE tour_id = t.id
      ) tc ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS stats_signed,
          COUNT(*) FILTER (WHERE is_paid = true) AS stats_paid,
          COALESCE(SUM(cost_cents), 0) AS total_cost,
          COALESCE(SUM(prepayment_cents), 0) AS total_prepay
        FROM tour_guests
        WHERE tour_id = t.id
      ) g ON TRUE
      WHERE t.company_id = $1
        AND t.start_date >= $2
        AND t.start_date <= $3
        AND t.status NOT IN ('canceled')
      ORDER BY t.start_date ASC
      LIMIT 50
      `,
      [companyId, startStr, endStr]
    );

    await pool.end();

    const rows = toursRes.rows || [];
    const todayTime = today.getTime();
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowTime = tomorrowDate.getTime();
    
    const items = rows.map((row) => {
      const startDate = row.start_date_str || null;
      const readinessTotal = Math.max(row.total_components || 0, 1);
      const readinessFilled = row.filled_components || 0;
      const readiness = Math.round((readinessFilled / readinessTotal) * 100);
      
      // Собираем чего не хватает - только если компонент ТРЕБУЕТСЯ но НЕ заполнен
      const missingComponents = [];
      if (row.require_guide && !row.has_guide) missingComponents.push('гид');
      if (row.require_driver && !row.has_driver) missingComponents.push('транспорт');
      if (row.require_hotel && !row.has_hotel) missingComponents.push('отель');

      const target = Number.isFinite(row.tourists_count) ? row.tourists_count : null;
      const signed = Number(row.signed_count) || 0;

      const totalCost = Number(row.total_cost) || 0;
      const totalPrepay = Number(row.total_prepay) || 0;
      const allPaid = row.paid_count >= signed && signed > 0;
      const payment =
        totalCost === 0
          ? 'unpaid'
          : allPaid || totalPrepay >= totalCost
          ? 'paid'
          : totalPrepay > 0
          ? 'partial'
          : 'unpaid';

      // Определяем статус на основе даты и готовности
      const tourDate = row.start_date ? new Date(row.start_date) : null;
      tourDate?.setHours(0, 0, 0, 0);
      const tourTime = tourDate?.getTime() || 0;
      
      // Тур сегодня или завтра?
      const isUrgent = tourTime === todayTime || tourTime === tomorrowTime;
      
      let status = 'planned';
      let statusLabel = 'Планово';
      
      if (isUrgent && missingComponents.length > 0) {
        // Сегодня/завтра и есть проблемы - риск!
        status = 'risk';
        statusLabel = 'Риск';
      } else if (row.status === 'active' || row.status === 'confirmed') {
        status = 'in_progress';
        statusLabel = 'В пути';
      } else if (readiness >= 100 && missingComponents.length === 0) {
        status = 'ideal';
        statusLabel = 'Готов';
      } else {
        // Послезавтра или позже
        status = 'planned';
        statusLabel = 'Планово';
      }

      return {
        id: row.id,
        startDate,
        time: '—',
        destination: row.name || 'Тур',
        pax: target ? `${signed}/${target}` : `${signed}`,
        readiness,
        readinessWarning: '',
        missingComponents,
        payment,
        status,
        statusLabel,
      };
    });

    return res.status(200).json({ trips: items });
  } catch (error) {
    console.error('Owner upcoming error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
