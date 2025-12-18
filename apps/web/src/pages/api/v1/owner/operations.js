// API: /api/v1/owner/operations
// Операционная статистика для Owner (KPI, критические риски, проблемные оплаты, список туров)

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calcDiffLabel = (current, prev) => {
  const diff = current - prev;
  return diff >= 0 ? `+${diff}` : `${diff}`;
};

const getTrend = (current, prev) => {
  if (current > prev) return 'up';
  if (current < prev) return 'down';
  return 'neutral';
};

const formatCompactMoney = (value) => {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return `${Math.round(value)}`;
};

const RISK_LABELS = {
  missing_guide: 'Не назначен гид',
  missing_vehicle: 'Не назначен транспорт',
  missing_hotel: 'Не указан отель',
  guide_conflict: 'Конфликт гида',
  tourists_missing_data: 'Нет данных туристов',
  high_debt_before_tour: 'Большая задолженность',
  outstanding_debt: 'Задолженность после тура',
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

    const {
      companyId,
      period = 'today',
      start,
      end,
      status = 'all',
      risk = 'all',
      search = '',
    } = req.query || {};

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

    // Диапазон дат по фильтру
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate;
    let endDate;

    switch (period) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'tomorrow': {
        const t = new Date(today);
        t.setDate(t.getDate() + 1);
        startDate = t;
        endDate = new Date(t);
        break;
      }
      case '7days': {
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 6);
        break;
      }
      case '30days': {
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 29);
        break;
      }
      case 'custom': {
        if (!isIsoDate(start) || !isIsoDate(end)) {
          return res.status(400).json({
            error: 'start and end are required for custom period (YYYY-MM-DD)',
          });
        }
        startDate = new Date(`${start}T00:00:00`);
        endDate = new Date(`${end}T00:00:00`);
        break;
      }
      default:
        startDate = new Date(today);
        endDate = new Date(today);
    }

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Предыдущий период для сравнения
    const periodDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    const prevStartDateStr = formatDate(prevStartDate);
    const prevEndDateStr = formatDate(prevEndDate);

    const [
      toursCurrentRes,
      toursPrevRes,
      prepCurrentRes,
      prepPrevRes,
      criticalRisksRes,
      criticalRisksByTypeRes,
      criticalRiskToursRes,
      paymentsProblemsRes,
      toursRes,
    ] = await Promise.all([
      // Туры в период
      pool.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE t.status NOT IN ('draft','canceled')) AS total,
          COUNT(*) FILTER (WHERE t.status = 'active') AS active,
          COUNT(*) FILTER (WHERE t.status IN ('planned','confirmed')) AS preparing
        FROM tours t
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status <> 'canceled'
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // Туры в предыдущий период
      pool.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE t.status NOT IN ('draft','canceled')) AS total
        FROM tours t
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status <> 'canceled'
        `,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),

      // В подготовке (не полностью заполнены компоненты) — только planned/confirmed
      pool.query(
        `
        SELECT COUNT(*) AS count
        FROM tours t
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_components,
            COUNT(*) FILTER (
              WHERE tc.guide_id IS NOT NULL
                 OR tc.hotel_id IS NOT NULL
                 OR tc.driver_id IS NOT NULL
                 OR tc.custom IS NOT NULL
            ) AS filled_components
          FROM tour_components tc
          WHERE tc.tour_id = t.id
        ) tc_meta ON TRUE
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status IN ('planned','confirmed')
          AND (
            COALESCE(tc_meta.total_components, 0) = 0
            OR COALESCE(tc_meta.filled_components, 0) < COALESCE(tc_meta.total_components, 0)
          )
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // В подготовке — предыдущий период
      pool.query(
        `
        SELECT COUNT(*) AS count
        FROM tours t
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_components,
            COUNT(*) FILTER (
              WHERE tc.guide_id IS NOT NULL
                 OR tc.hotel_id IS NOT NULL
                 OR tc.driver_id IS NOT NULL
                 OR tc.custom IS NOT NULL
            ) AS filled_components
          FROM tour_components tc
          WHERE tc.tour_id = t.id
        ) tc_meta ON TRUE
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status IN ('planned','confirmed')
          AND (
            COALESCE(tc_meta.total_components, 0) = 0
            OR COALESCE(tc_meta.filled_components, 0) < COALESCE(tc_meta.total_components, 0)
          )
        `,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),

      // Критические риски (только severity=critical)
      pool.query(
        `
        SELECT COUNT(*) AS count
        FROM v_open_risks r
        WHERE r.company_id = $1
          AND r.severity = 'critical'
          AND r.start_date >= $2
          AND r.start_date <= $3
          AND r.tour_status NOT IN ('draft', 'canceled')
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // Критические риски по типам
      pool.query(
        `
        SELECT
          r.risk_type,
          COUNT(*) AS count,
          MIN(r.title) AS sample_title
        FROM v_open_risks r
        WHERE r.company_id = $1
          AND r.severity = 'critical'
          AND r.start_date >= $2
          AND r.start_date <= $3
          AND r.tour_status NOT IN ('draft', 'canceled')
        GROUP BY r.risk_type
        ORDER BY count DESC
        LIMIT 6
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // Туры с критическими рисками (для баннера)
      pool.query(
        `
        SELECT
          r.tour_id,
          MIN(r.tour_name) AS tour_name,
          MIN(r.start_date) AS start_date,
          COUNT(*) AS risks_count
        FROM v_open_risks r
        WHERE r.company_id = $1
          AND r.severity = 'critical'
          AND r.start_date >= $2
          AND r.start_date <= $3
          AND r.tour_status NOT IN ('draft', 'canceled')
        GROUP BY r.tour_id
        ORDER BY MIN(r.start_date) ASC NULLS LAST, risks_count DESC
        LIMIT 3
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // Проблемные оплаты: есть неоплаченная сумма (cost - prepayment) у любого туриста
      pool.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE COALESCE(fin.debt_cents, 0) > 0) AS tours_with_debt,
          COALESCE(SUM(COALESCE(fin.debt_cents, 0)) FILTER (WHERE COALESCE(fin.debt_cents, 0) > 0), 0) AS total_debt_cents
        FROM tours t
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(
              SUM(GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0))
                FILTER (WHERE tg.is_paid = false),
              0
            ) AS debt_cents
          FROM tour_guests tg
          WHERE tg.tour_id = t.id
        ) fin ON TRUE
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status NOT IN ('draft', 'canceled')
        `,
        [companyId, startDateStr, endDateStr]
      ),

      // Список туров (для таблицы)
      pool.query(
        `
        SELECT
          t.id,
          t.name,
          t.status,
          t.start_date,
          t.end_date,
          t.tourists_count,
          u.first_name AS coordinator_first_name,
          u.last_name AS coordinator_last_name,
          u.email AS coordinator_email,
          g.full_name AS main_guide_name,
          guide_meta.guide_names,
          transport_meta.transport_name,
          transport_meta.transport_plate,
          COALESCE(tc_meta.total_components, 0) AS total_components,
          COALESCE(tc_meta.filled_components, 0) AS filled_components,
          COALESCE(fin.signed_count, 0) AS signed_count,
          COALESCE(fin.paid_count, 0) AS paid_count,
          COALESCE(fin.total_cost_cents, 0) AS total_cost_cents,
          COALESCE(fin.total_prepay_cents, 0) AS total_prepay_cents,
          COALESCE(fin.debt_cents, 0) AS debt_cents,
          COALESCE(risk_counts.critical_count, 0) AS critical_risks,
          COALESCE(risk_counts.warning_count, 0) AS warning_risks,
          COALESCE(risk_counts.attention_count, 0) AS attention_risks
        FROM tours t
        LEFT JOIN users u ON u.id = t.coordinator_id
        LEFT JOIN guides g ON g.id = t.main_guide_id
        LEFT JOIN LATERAL (
          SELECT array_agg(g2.full_name ORDER BY g2.full_name) AS guide_names
          FROM tour_components tc
          JOIN guides g2 ON g2.id = tc.guide_id
          WHERE tc.tour_id = t.id
            AND tc.type = 'guide'
            AND tc.guide_id IS NOT NULL
        ) guide_meta ON TRUE
        LEFT JOIN LATERAL (
          SELECT d.car_name AS transport_name, d.plate_number AS transport_plate
          FROM tour_components tc
          JOIN drivers d ON d.id = tc.driver_id
          WHERE tc.tour_id = t.id
            AND tc.type = 'transport'
            AND tc.driver_id IS NOT NULL
          ORDER BY tc.created_at ASC
          LIMIT 1
        ) transport_meta ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_components,
            COUNT(*) FILTER (
              WHERE tc.guide_id IS NOT NULL
                 OR tc.hotel_id IS NOT NULL
                 OR tc.driver_id IS NOT NULL
                 OR tc.custom IS NOT NULL
            ) AS filled_components
          FROM tour_components tc
          WHERE tc.tour_id = t.id
        ) tc_meta ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS signed_count,
            COUNT(*) FILTER (WHERE tg.is_paid = true) AS paid_count,
            COALESCE(SUM(tg.cost_cents), 0) AS total_cost_cents,
            COALESCE(SUM(tg.prepayment_cents), 0) AS total_prepay_cents,
            COALESCE(
              SUM(GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0))
                FILTER (WHERE tg.is_paid = false),
              0
            ) AS debt_cents
          FROM tour_guests tg
          WHERE tg.tour_id = t.id
        ) fin ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) FILTER (WHERE r.severity = 'critical') AS critical_count,
            COUNT(*) FILTER (WHERE r.severity = 'warning') AS warning_count,
            COUNT(*) FILTER (WHERE r.severity = 'attention') AS attention_count
          FROM v_open_risks r
          WHERE r.tour_id = t.id
        ) risk_counts ON TRUE
        WHERE t.company_id = $1
          AND t.start_date >= $2
          AND t.start_date <= $3
          AND t.status <> 'canceled'
        ORDER BY t.start_date ASC NULLS LAST, t.created_at DESC
        LIMIT 200
        `,
        [companyId, startDateStr, endDateStr]
      ),
    ]);

    await pool.end();

    const toursTotal = Number(toursCurrentRes.rows[0]?.total || 0);
    const toursActive = Number(toursCurrentRes.rows[0]?.active || 0);
    const toursPreparing = Number(toursCurrentRes.rows[0]?.preparing || 0);
    const toursPrevTotal = Number(toursPrevRes.rows[0]?.total || 0);

    const prepCurrent = Number(prepCurrentRes.rows[0]?.count || 0);
    const prepPrev = Number(prepPrevRes.rows[0]?.count || 0);

    const criticalRisksCount = Number(criticalRisksRes.rows[0]?.count || 0);

    const toursWithDebt = Number(paymentsProblemsRes.rows[0]?.tours_with_debt || 0);
    const totalDebtSom = Number(paymentsProblemsRes.rows[0]?.total_debt_cents || 0) / 100;

    const periodLabel =
      period === 'today'
        ? 'Туры сегодня'
        : period === 'tomorrow'
        ? 'Туры завтра'
        : period === '7days'
        ? 'Туры за 7 дней'
        : period === '30days'
        ? 'Туры за 30 дней'
        : 'Туры в период';

    const stats = [
      {
        label: periodLabel,
        value: toursTotal,
        icon: 'today',
        change: calcDiffLabel(toursTotal, toursPrevTotal),
        trend: getTrend(toursTotal, toursPrevTotal),
        subtitle: `${toursActive} в пути, ${toursPreparing} готовятся`,
      },
      {
        label: 'В подготовке',
        value: prepCurrent,
        icon: 'pending_actions',
        change: calcDiffLabel(prepCurrent, prepPrev),
        trend: getTrend(prepCurrent, prepPrev),
        subtitle: `${startDateStr} — ${endDateStr}`,
      },
      {
        label: 'Критические риски',
        value: criticalRisksCount,
        icon: 'report_problem',
        change: 'Критично',
        trend: 'critical',
        subtitle: 'Требуют внимания',
        variant: 'danger',
      },
      {
        label: 'Проблемные оплаты',
        value: toursWithDebt,
        icon: 'account_balance_wallet',
        change: `${formatCompactMoney(totalDebtSom)} KGS`,
        trend: toursWithDebt > 0 ? 'warning' : 'neutral',
        subtitle: 'Есть неоплаченные суммы',
        variant: toursWithDebt > 0 ? 'warning' : undefined,
      },
    ];

    const warnings = (criticalRisksByTypeRes.rows || []).map((row) => {
      const type = row.risk_type;
      const label =
        RISK_LABELS[type] || row.sample_title || String(type || 'risk');
      return {
        type,
        label,
        count: Number(row.count) || 0,
      };
    });

    const warningTours = (criticalRiskToursRes.rows || []).map((row) => ({
      id: row.tour_id,
      name: row.tour_name || null,
      start_date: row.start_date ? formatDate(new Date(row.start_date)) : null,
      risks_count: Number(row.risks_count) || 0,
    }));

    const tours = (toursRes.rows || []).map((row) => {
      const totalComponents = Number(row.total_components) || 0;
      const filledComponents = Number(row.filled_components) || 0;
      const readinessTotal = Math.max(totalComponents, 1);

      const totalCost = Number(row.total_cost_cents) || 0;
      const debtCents = Number(row.debt_cents) || 0;
      const signed = Number(row.signed_count) || 0;

      const payment =
        signed === 0 || totalCost === 0
          ? 'empty'
          : debtCents > 0
          ? 'due'
          : 'paid';

      const critical = Number(row.critical_risks) || 0;
      const warn = Number(row.warning_risks) || 0;
      const attention = Number(row.attention_risks) || 0;

      const riskLevel =
        critical > 0 ? 'high' : warn > 0 ? 'medium' : attention > 0 ? 'low' : 'none';

      const computedStatus =
        totalComponents === 0
          ? 'planned'
          : filledComponents >= totalComponents
          ? 'confirmed'
          : 'planned';

      const uiStatus =
        row.status === 'draft'
          ? 'draft'
          : row.status === 'active'
          ? 'active'
          : computedStatus === 'confirmed'
          ? 'confirmed'
          : 'preparing';

      const guideNames = Array.isArray(row.guide_names) ? row.guide_names : [];
      const guideName = row.main_guide_name || guideNames[0] || null;

      const transportName = row.transport_name || null;
      const transportPlate = row.transport_plate || null;
      const transportWarning = !!transportName && !transportPlate;

      const coordinatorName = [row.coordinator_first_name, row.coordinator_last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      const responsibleName = coordinatorName || row.coordinator_email || '—';
      const initials = responsibleName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => (p[0] || '').toUpperCase())
        .join('');

      const targetPax = Number.isFinite(Number(row.tourists_count))
        ? Number(row.tourists_count)
        : null;
      const paxText = `${signed}/${targetPax ?? '—'}`;

      return {
        id: row.id,
        date: row.start_date ? formatDate(new Date(row.start_date)) : '—',
        time: '—',
        name: row.name || 'Тур',
        pax: paxText,
        status: uiStatus,
        responsible: { initials: initials || '—', name: responsibleName },
        guide: guideName,
        transport: { name: transportName, plate: transportPlate, warning: transportWarning },
        readiness: { current: filledComponents, total: readinessTotal },
        payment,
        risk: riskLevel,
        notes: debtCents > 0 ? 'Есть долг' : '-',
        isHighRisk: riskLevel === 'high',
      };
    });

    // Доп фильтры по UI (status/risk/search) применяем уже на уровне ответа,
    // чтобы не усложнять SQL и не зависеть от моковых значений в селектах.
    const normalizedSearch = String(search || '').trim().toLowerCase();
    const filteredTours = tours.filter((t) => {
      if (normalizedSearch && !String(t.name || '').toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      if (status && status !== 'all' && t.status !== status) {
        return false;
      }

      if (risk && risk !== 'all' && t.risk !== risk) {
        return false;
      }

      return true;
    });

    return res.status(200).json({
      period: { start: startDateStr, end: endDateStr, label: period },
      stats,
      warnings,
      warningTours,
      tours: filteredTours,
    });
  } catch (error) {
    console.error('Owner operations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
