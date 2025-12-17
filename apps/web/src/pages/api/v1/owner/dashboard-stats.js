// API: /api/v1/owner/dashboard-stats
// Возвращает статистику для главной страницы Owner Dashboard

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Авторизация
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

    const { companyId, period = 'today' } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Проверяем роль пользователя
    const roleRes = await pool.query(
      'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2',
      [payload.sub, companyId]
    );

    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      await pool.end();
      return res.status(403).json({ error: 'Access denied' });
    }

    // Определяем диапазон дат на основе периода
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    switch (period) {
      case 'today':
        startDate = today;
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // 7 дней включая сегодня
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // 30 дней включая сегодня
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '6months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6); // 6 месяцев назад
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1); // 1 год назад
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = today;
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
    }

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Предыдущий период для сравнения
    const periodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const prevStartDateStr = formatDate(prevStartDate);
    const prevEndDateStr = formatDate(prevEndDate);

    // Запросы к базе данных
    const [
      toursCurrentRes,
      toursPrevRes,
      touristsCurrentRes,
      touristsPrevRes,
      revenueCurrentRes,
      revenuePrevRes,
      debtRes,
      npsCurrentRes,
      npsPrevRes,
      revenueSeriesRes,
    ] = await Promise.all([
      // Количество туров за текущий период (по start_date)
      pool.query(
        `SELECT COUNT(*) as count 
         FROM tours 
         WHERE company_id = $1 
           AND start_date >= $2 
           AND start_date <= $3
           AND status NOT IN ('draft', 'canceled')`,
        [companyId, startDateStr, endDateStr]
      ),
      
      // Количество туров за предыдущий период
      pool.query(
        `SELECT COUNT(*) as count 
         FROM tours 
         WHERE company_id = $1 
           AND start_date >= $2 
           AND start_date <= $3
           AND status NOT IN ('draft', 'canceled')`,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),
      
      // Количество туристов за текущий период
      pool.query(
        `SELECT COUNT(tg.id) as count 
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,
        [companyId, startDateStr, endDateStr]
      ),
      
      // Количество туристов за предыдущий период
      pool.query(
        `SELECT COUNT(tg.id) as count 
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),
      
      // Выручка за текущий период:
      // Полученные деньги = предоплата для всех + остаток для полностью оплаченных
      // Или проще: если оплачено — вся стоимость, иначе — предоплата
      pool.query(
        `SELECT COALESCE(SUM(
            CASE
              WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
              ELSE COALESCE(tg.prepayment_cents, 0)
            END
          ), 0) AS total
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,
        [companyId, startDateStr, endDateStr]
      ),
      
      // Выручка за предыдущий период по той же логике
      pool.query(
        `SELECT COALESCE(SUM(
            CASE
              WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
              ELSE COALESCE(tg.prepayment_cents, 0)
            END
          ), 0) AS total
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,
        [companyId, prevStartDateStr, prevEndDateStr]
      ),
      
      // Дебиторка (неоплаченные суммы по всем турам)
      // Это сумма (стоимость - предоплата) для неоплаченных гостей
      pool.query(
        `SELECT COALESCE(SUM(GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)), 0) as debt
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND tg.is_paid = false
           AND t.status NOT IN ('draft', 'canceled')`,
        [companyId]
      ),
      
      // NPS (средний рейтинг туров) за текущий период
      pool.query(
        `SELECT 
           COALESCE(AVG(tf.rating_tour), 0) as avg_rating,
           COUNT(tf.rating_tour) as count
         FROM tour_feedbacks tf
         JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
         JOIN tours t ON tfl.tour_id = t.id
      WHERE tfl.company_id = $1 
        AND t.start_date >= $2 
        AND t.start_date <= $3
        AND tf.rating_tour IS NOT NULL`,
      [companyId, startDateStr, endDateStr]
    ),
    
    // NPS за предыдущий период для сравнения
    pool.query(
      `SELECT 
           COALESCE(AVG(tf.rating_tour), 0) as avg_rating,
           COUNT(tf.rating_tour) as count
         FROM tour_feedbacks tf
         JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
         JOIN tours t ON tfl.tour_id = t.id
      WHERE tfl.company_id = $1 
        AND t.start_date >= $2 
        AND t.start_date <= $3
        AND tf.rating_tour IS NOT NULL`,
      [companyId, prevStartDateStr, prevEndDateStr]
    ),

    // Динамика выручки по дням (оплачено = вся сумма, неоплачено = предоплата)
    pool.query(
      `SELECT
         t.start_date::date AS day,
         COALESCE(SUM(
           CASE
             WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
             ELSE COALESCE(tg.prepayment_cents, 0)
           END
         ), 0) AS total_cents
       FROM tours t
       JOIN tour_guests tg ON tg.tour_id = t.id
       WHERE t.company_id = $1
         AND t.start_date >= $2
         AND t.start_date <= $3
         AND t.status NOT IN ('draft', 'canceled')
       GROUP BY day
       ORDER BY day ASC`,
      [companyId, startDateStr, endDateStr]
    ),
  ]);

    await pool.end();

    // Обработка результатов
    const toursCurrent = parseInt(toursCurrentRes.rows[0]?.count || 0);
    const toursPrev = parseInt(toursPrevRes.rows[0]?.count || 0);
    
    const touristsCurrent = parseInt(touristsCurrentRes.rows[0]?.count || 0);
    const touristsPrev = parseInt(touristsPrevRes.rows[0]?.count || 0);
    
  const revenueCurrent = parseInt(revenueCurrentRes.rows[0]?.total || 0) / 100; // центы в сомы
  const revenuePrev = parseInt(revenuePrevRes.rows[0]?.total || 0) / 100;
  
  const debt = parseInt(debtRes.rows[0]?.debt || 0) / 100;
  const rawRevenueSeries = revenueSeriesRes.rows || [];
    
    // NPS (средний рейтинг туров)
    const npsCurrent = parseFloat(npsCurrentRes.rows[0]?.avg_rating || 0);
    const npsCount = parseInt(npsCurrentRes.rows[0]?.count || 0);
    const npsPrev = parseFloat(npsPrevRes.rows[0]?.avg_rating || 0);

    // Форматирование значений
    const formatMoney = (value) => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
      }
      return value.toString();
    };

    // Вычисление изменений
    const calcChange = (current, prev) => {
      if (prev === 0) {
        return current > 0 ? '+100%' : '0%';
      }
      const change = ((current - prev) / prev * 100).toFixed(0);
      return change >= 0 ? `+${change}%` : `${change}%`;
    };

    const calcDiff = (current, prev) => {
      const diff = current - prev;
      return diff >= 0 ? `+${diff}` : `${diff}`;
    };

    // Определение трендов
    const getTrend = (current, prev) => {
      if (current > prev) return 'up';
      if (current < prev) return 'down';
      return 'neutral';
    };

    // Уровень дебиторки
    const getDebtLevel = (debt, revenue) => {
      if (debt === 0) return { text: 'Нет', trend: 'up' };
      if (revenue === 0 || debt / revenue > 0.3) return { text: 'Высокая', trend: 'warning' };
      if (debt / revenue > 0.15) return { text: 'Средняя', trend: 'neutral' };
      return { text: 'Низкая', trend: 'up' };
    };

    const debtLevel = getDebtLevel(debt, revenueCurrent);

    // Формируем серию данных с группировкой в зависимости от периода
    const totalsByDate = rawRevenueSeries.reduce((acc, row) => {
      const key = row.day instanceof Date ? formatDate(row.day) : String(row.day).slice(0, 10);
      acc[key] = (row.total_cents || 0) / 100;
      return acc;
    }, {});

    let series = [];
    
    if (period === '6months' || period === 'year') {
      // Группировка по месяцам для 6 месяцев и года
      const monthsCount = period === 'year' ? 12 : 6;
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      
      for (let i = monthsCount - 1; i >= 0; i--) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - i);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        
        // Собираем сумму за весь месяц
        let monthTotal = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          monthTotal += totalsByDate[dayKey] || 0;
        }
        
        series.push({
          date: `${year}-${String(month + 1).padStart(2, '0')}`,
          label: monthNames[month],
          value: Math.round(monthTotal),
          type: 'month'
        });
      }
    } else if (period === '30days') {
      // Группировка по неделям для 30 дней (4-5 недель)
      const weekLabels = ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5'];
      const dateCursor = new Date(startDate);
      dateCursor.setHours(0, 0, 0, 0);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(0, 0, 0, 0);
      
      let weekIndex = 0;
      let weekTotal = 0;
      let daysInWeek = 0;
      let weekStartDate = new Date(dateCursor);
      
      while (dateCursor <= endDateObj) {
          const key = formatDate(dateCursor);
          weekTotal += totalsByDate[key] || 0;
        daysInWeek++;
        
        // Каждые 7 дней или в конце периода сохраняем неделю
        if (daysInWeek === 7 || dateCursor.getTime() === endDateObj.getTime()) {
          const weekEndDate = new Date(dateCursor);
          const startDay = weekStartDate.getDate();
          const endDay = weekEndDate.getDate();
          const startMonth = weekStartDate.toLocaleDateString('ru-RU', { month: 'short' });
          const endMonth = weekEndDate.toLocaleDateString('ru-RU', { month: 'short' });
          
          series.push({
            date: formatDate(weekStartDate),
            label: startMonth === endMonth 
              ? `${startDay}-${endDay} ${startMonth}` 
              : `${startDay} ${startMonth} - ${endDay} ${endMonth}`,
            value: Math.round(weekTotal),
            type: 'week'
          });
          
          weekIndex++;
          weekTotal = 0;
          daysInWeek = 0;
          weekStartDate = new Date(dateCursor);
          weekStartDate.setDate(weekStartDate.getDate() + 1);
        }
        
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
    } else {
      // Для today и 7days показываем по дням
      const dateCursor = new Date(startDate);
      dateCursor.setHours(0, 0, 0, 0);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(0, 0, 0, 0);
      
      while (dateCursor <= endDateObj) {
        const key = formatDate(dateCursor);
        series.push({ 
          date: key, 
          value: totalsByDate[key] || 0,
          type: 'day'
        });
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
    }

    const stats = {
      tours: {
        value: toursCurrent.toString(),
        change: `${calcDiff(toursCurrent, toursPrev)} vs пред.`,
        trend: getTrend(toursCurrent, toursPrev),
      },
      tourists: {
        value: touristsCurrent.toString(),
        change: calcChange(touristsCurrent, touristsPrev),
        trend: getTrend(touristsCurrent, touristsPrev),
      },
      revenue: {
        value: formatMoney(revenueCurrent),
        change: calcChange(revenueCurrent, revenuePrev),
        trend: getTrend(revenueCurrent, revenuePrev),
      },
      margin: {
        value: '0%', // Пока нет данных о расходах
        change: '-',
        trend: 'neutral',
      },
      debt: {
        value: formatMoney(debt),
        change: debtLevel.text,
        trend: debtLevel.trend,
      },
      nps: {
        value: npsCurrent > 0 ? npsCurrent.toFixed(1) : '—',
        valueSuffix: '/5',
        rating: npsCurrent,
        count: npsCount,
        change: npsCount > 0 
          ? (npsPrev > 0 
              ? `${npsCurrent >= npsPrev ? '+' : ''}${(npsCurrent - npsPrev).toFixed(1)} vs пред.` 
              : `${npsCount} отзывов`)
          : 'Нет отзывов',
        trend: npsCurrent >= 4 ? 'up' : npsCurrent >= 3 ? 'neutral' : npsCurrent > 0 ? 'down' : 'neutral',
        isRating: true,
      },
      period: {
        start: startDateStr,
        end: endDateStr,
        label: period,
      },
      revenueSeries: series,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
