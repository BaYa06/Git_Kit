// API: /api/v1/owner/finances
// Возвращает KPI, динамику и ожидаемые поступления для страницы Финансы

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMoneyShort = (value) => {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const calcChange = (current, prev) => {
  const c = Number(current || 0);
  const p = Number(prev || 0);
  if (p === 0) {
    if (c === 0) return { value: '0%', type: 'neutral' };
    return { value: '+100%', type: 'positive' };
  }
  const diffPct = ((c - p) / p) * 100;
  const type = diffPct >= 0 ? 'positive' : 'negative';
  const rounded = `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(0)}%`;
  return { value: rounded, type };
};

const ensureDateRange = (period, startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  switch (period) {
    case 'today':
      start = new Date(today);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    case '7days':
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    case '30days':
      start = new Date(today);
      start.setDate(start.getDate() - 29);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        // если нет валидного периода — откатываемся на 30 дней
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
      }
      break;
    default:
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
  }

  const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - periodDays);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  return {
    start,
    end,
    prevStart,
    prevEnd,
    startStr: formatDate(start),
    endStr: formatDate(end),
    prevStartStr: formatDate(prevStart),
    prevEndStr: formatDate(prevEnd),
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Авторизация по cookie
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  if (!pair) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(token, JWT_SECRET);

    const { companyId, period = '7days', startDate, endDate } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'companyId is required' });
    }

    const client = await pool.connect();
    try {
      // проверяем роль
      const roleRes = await client.query(
        'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
        [payload.sub, companyId]
      );
      if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const range = ensureDateRange(period, startDate, endDate);

      // KPI: текущий период
      const kpiCurrentRes = await client.query(
        `SELECT 
            COALESCE(SUM(tg.cost_cents), 0) AS revenue_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
                ELSE COALESCE(tg.prepayment_cents, 0)
              END
            ), 0) AS income_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = false 
                     AND t.start_date <= CURRENT_DATE
                     AND t.start_date >= $2
                     AND t.start_date <= $3
                  THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
                ELSE 0
              END
            ), 0) AS receivable_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = false THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
                ELSE 0
              END
            ), 0) AS expected_due_cents,
            COUNT(tg.id) AS guests_count,
            AVG(NULLIF(tg.cost_cents, 0)) AS avg_check_cents
         FROM tours t
         JOIN tour_guests tg ON tg.tour_id = t.id
         WHERE t.company_id = $1
           AND t.start_date >= $2
           AND t.start_date <= $3
           AND t.status NOT IN ('draft','canceled')`,
        [companyId, range.startStr, range.endStr]
      );

      // KPI: предыдущий период
      const kpiPrevRes = await client.query(
        `SELECT 
            COALESCE(SUM(tg.cost_cents), 0) AS revenue_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
                ELSE COALESCE(tg.prepayment_cents, 0)
              END
            ), 0) AS income_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = false 
                     AND t.start_date <= CURRENT_DATE
                     AND t.start_date >= $2
                     AND t.start_date <= $3
                  THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
                ELSE 0
              END
            ), 0) AS receivable_cents,
            COALESCE(SUM(
              CASE
                WHEN tg.is_paid = false THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
                ELSE 0
              END
            ), 0) AS expected_due_cents,
            COUNT(tg.id) AS guests_count,
            AVG(NULLIF(tg.cost_cents, 0)) AS avg_check_cents
         FROM tours t
         JOIN tour_guests tg ON tg.tour_id = t.id
         WHERE t.company_id = $1
           AND t.start_date >= $2
           AND t.start_date <= $3
           AND t.status NOT IN ('draft','canceled')`,
        [companyId, range.prevStartStr, range.prevEndStr]
      );

      // Динамика (текущий)
      const seriesCurrentRes = await client.query(
        `SELECT
           t.start_date::date AS day,
           COALESCE(SUM(tg.cost_cents), 0) AS revenue_cents,
           COALESCE(SUM(
             CASE
               WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
               ELSE COALESCE(tg.prepayment_cents, 0)
             END
           ), 0) AS income_cents,
           COALESCE(SUM(
             CASE
               WHEN tg.is_paid = false THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
               ELSE 0
             END
           ), 0) AS receivable_cents
         FROM tours t
         JOIN tour_guests tg ON tg.tour_id = t.id
         WHERE t.company_id = $1
           AND t.start_date >= $2
           AND t.start_date <= $3
           AND t.status NOT IN ('draft','canceled')
         GROUP BY day
         ORDER BY day ASC`,
        [companyId, range.startStr, range.endStr]
      );

      // Динамика (прошлый период)
      const seriesPrevRes = await client.query(
        `SELECT
           t.start_date::date AS day,
           COALESCE(SUM(tg.cost_cents), 0) AS revenue_cents,
           COALESCE(SUM(
             CASE
               WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
               ELSE COALESCE(tg.prepayment_cents, 0)
             END
           ), 0) AS income_cents,
           COALESCE(SUM(
             CASE
               WHEN tg.is_paid = false THEN GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)
               ELSE 0
             END
           ), 0) AS receivable_cents
         FROM tours t
         JOIN tour_guests tg ON tg.tour_id = t.id
         WHERE t.company_id = $1
           AND t.start_date >= $2
           AND t.start_date <= $3
           AND t.status NOT IN ('draft','canceled')
         GROUP BY day
         ORDER BY day ASC`,
        [companyId, range.prevStartStr, range.prevEndStr]
      );

      // Просрочки за текущий месяц (независимо от выбранного периода)
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const overdueRes = await client.query(
        `SELECT 
           tg.id,
           tg.full_name,
           tg.cost_cents,
           tg.prepayment_cents,
           tg.is_paid,
           t.start_date,
           t.name AS tour_name
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1
           AND (tg.is_primary = true OR tg.primary_id IS NULL)
           AND t.status NOT IN ('draft','canceled')
           AND tg.is_paid = false
           AND GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0) > 0
           AND t.start_date >= $2
           AND t.start_date <= $3
           AND t.start_date < CURRENT_DATE
         ORDER BY t.start_date ASC
         LIMIT 200`,
        [companyId, formatDate(monthStart), formatDate(monthEnd)]
      );

      // Формирование KPI
      const current = kpiCurrentRes.rows[0] || {};
      const prev = kpiPrevRes.rows[0] || {};

      const revenueCurr = Number(current.revenue_cents || 0) / 100;
      const revenuePrev = Number(prev.revenue_cents || 0) / 100;
      const incomeCurr = Number(current.income_cents || 0) / 100;
      const incomePrev = Number(prev.income_cents || 0) / 100;
      const receivableCurr = Number(current.receivable_cents || 0) / 100;
      const receivablePrev = Number(prev.receivable_cents || 0) / 100;
      const expectedCurr = Number(current.expected_due_cents || 0) / 100;
      const expectedPrev = Number(prev.expected_due_cents || 0) / 100;

      const avgCheckCurr = Number(current.avg_check_cents || 0) / 100;
      const avgCheckPrev = Number(prev.avg_check_cents || 0) / 100;

      const revenueChange = calcChange(revenueCurr, revenuePrev);
      const incomeChange = calcChange(incomeCurr, incomePrev);
      const receivablesChange = calcChange(receivableCurr, receivablePrev);
      const expectedChange = calcChange(expectedCurr, expectedPrev);
      const kpis = [
        {
          id: 'revenue',
          label: 'Выручка',
          value: formatMoneyShort(revenueCurr),
          change: revenueChange.value,
          changeType: revenueChange.type,
          subtext: 'vs пред. период',
          icon: 'payments',
          iconBg: 'bg-indigo-50',
          iconColor: 'text-indigo-600',
        },
        {
          id: 'income',
          label: 'Поступления',
          value: formatMoneyShort(incomeCurr),
          change: incomeChange.value,
          changeType: incomeChange.type,
          subtext: 'vs пред. период',
          icon: 'account_balance_wallet',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
        },
        {
          id: 'receivables',
          label: 'Дебиторка',
          value: formatMoneyShort(receivableCurr),
          change: receivablesChange.value,
          changeType: receivableCurr <= receivablePrev ? 'positive' : receivablesChange.type,
          subtext: 'к снижению лучше',
          icon: 'money_off',
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
        },
        {
          id: 'expected',
          label: 'Ожидаемые поступления',
          value: formatMoneyShort(expectedCurr),
          change: expectedChange.value,
          changeType: expectedChange.type,
          subtext: 'по периоду',
          icon: 'pending_actions',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
        },
        {
          id: 'avgCheck',
          label: 'Средний чек',
          value: avgCheckCurr > 0 ? `${Math.round(avgCheckCurr).toLocaleString('ru-RU')}` : '—',
          progress: avgCheckPrev > 0 ? Math.min(100, Math.round((avgCheckCurr / avgCheckPrev) * 100)) : undefined,
          subtext: avgCheckPrev > 0 ? 'к прошлому периоду' : 'нет данных',
          icon: 'receipt_long',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
        },
      ];

      const safeSeries = (seriesCurrentRes.rows || []).map((row) => ({
        date: formatDate(new Date(row.day)),
        revenue: Number(row.revenue_cents || 0) / 100,
        income: Number(row.income_cents || 0) / 100,
        receivables: Number(row.receivable_cents || 0) / 100,
      }));

      const safePrevSeries = (seriesPrevRes.rows || []).map((row) => ({
        date: formatDate(new Date(row.day)),
        revenue: Number(row.revenue_cents || 0) / 100,
        income: Number(row.income_cents || 0) / 100,
        receivables: Number(row.receivable_cents || 0) / 100,
      }));

      const maxDayValue = safeSeries.reduce(
        (acc, p) => (p.revenue > acc ? p.revenue : acc),
        0
      );
      const avgDayValue =
        safeSeries.length > 0
          ? safeSeries.reduce((sum, p) => sum + p.revenue, 0) / safeSeries.length
          : 0;

      const expectedRows = (overdueRes.rows || []).map((row) => {
        const startDate = row.start_date ? new Date(row.start_date) : null;
        const due = Math.max(
          Number(row.cost_cents || 0) - Number(row.prepayment_cents || 0),
          0
        );
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return {
          id: row.id,
          client: row.full_name || 'Гость',
          tourName: row.tour_name || 'Тур',
          date: startDate ? startDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : '',
          dueAmount: due / 100,
          isOverdue: startDate ? startDate < now : false,
        };
      });

      const expectedTotals = overdueRes.rows.reduce(
        (acc, row) => {
          const due = Math.max(
            Number(row.cost_cents || 0) - Number(row.prepayment_cents || 0),
            0
          );
          acc.total += due;
          const startDate = row.start_date ? new Date(row.start_date) : null;
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          if (startDate && startDate < now) {
            acc.overdue += due;
          }
          return acc;
        },
        { total: 0, overdue: 0 }
      );

      return res.status(200).json({
        period: {
          start: range.startStr,
          end: range.endStr,
          label: period,
        },
        kpis,
        chart: {
          series: safeSeries,
          prevSeries: safePrevSeries,
          summary: {
            maxDay: maxDayValue,
            avgDay: avgDayValue,
          },
        },
        overdue: {
          total: expectedTotals.total / 100,
          overdue: expectedTotals.overdue / 100,
          rows: expectedRows,
          month: {
            start: formatDate(monthStart),
            end: formatDate(monthEnd),
          },
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (isDev) console.error('finances api error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
