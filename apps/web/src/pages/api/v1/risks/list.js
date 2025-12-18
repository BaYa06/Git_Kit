/**
 * API endpoint: GET /api/v1/risks/list
 * Получить список рисков компании (с фильтрацией)
 */

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

// Кэш последней проверки рисков (по компании)
const lastAutoCheck = new Map();
const AUTO_CHECK_INTERVAL_MS = 60 * 1000; // Не чаще чем раз в минуту

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  return pair ? decodeURIComponent(pair.split('=')[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Авторизация
  const token = tokenFromCookie(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error('JWT verify error:', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const { 
    company_id, 
    severity, 
    limit = 50,
    status = 'open' 
  } = req.query;

  if (!company_id) {
    return res.status(400).json({ message: 'company_id is required' });
  }

  const client = await pool.connect();
  try {
    // Проверяем доступ пользователя к компании
    const permRes = await client.query(`
      SELECT role FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `, [auth.sub, company_id]);

    if (permRes.rowCount === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // === АВТОМАТИЧЕСКАЯ ПРОВЕРКА РИСКОВ ===
    // Проверяем все туры на сегодня и завтра, чтобы риски были актуальными
    // Но не чаще чем раз в минуту на компанию
    const lastCheck = lastAutoCheck.get(company_id) || 0;
    const now = Date.now();
    
    if (now - lastCheck > AUTO_CHECK_INTERVAL_MS) {
      lastAutoCheck.set(company_id, now);
      
      try {
        const upcomingToursRes = await client.query(`
          SELECT id FROM tours
          WHERE company_id = $1
            AND status NOT IN ('completed', 'canceled', 'cancelled')
            AND start_date >= CURRENT_DATE
            AND start_date <= CURRENT_DATE + INTERVAL '2 days'
        `, [company_id]);

        if (upcomingToursRes.rows.length > 0) {
          // Динамический импорт checkTourRisks
          const { checkTourRisks } = await import('../../../../lib/riskEngine');
          
          // Проверяем каждый тур (параллельно для скорости)
          await Promise.all(
            upcomingToursRes.rows.map(tour => 
              checkTourRisks(tour.id).catch(err => {
                console.warn(`[Risks] Auto-check failed for tour ${tour.id}:`, err.message);
              })
            )
          );
          
          if (isDev) console.log(`[Risks] Auto-checked ${upcomingToursRes.rows.length} upcoming tours`);
        }
      } catch (autoCheckErr) {
        // Не блокируем выдачу рисков если автопроверка упала
        console.warn('[Risks] Auto-check error:', autoCheckErr.message);
      }
    }
    // === КОНЕЦ АВТОПРОВЕРКИ ===

    // Получаем риски
    let query = `
      SELECT * FROM v_open_risks
      WHERE company_id = $1
    `;
    
    const params = [company_id];
    let paramIndex = 2;
    
    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }
    
    if (status && status !== 'open') {
      // Для других статусов используем основную таблицу
      query = `
        SELECT 
          r.*,
          t.name as tour_name,
          t.start_date,
          t.company_id
        FROM tour_risks r
        JOIN tours t ON r.tour_id = t.id
        WHERE t.company_id = $1 AND r.status = $${paramIndex}
      `;
      params.push(status);
      paramIndex++;
      
      if (severity) {
        query += ` AND r.severity = $${paramIndex}`;
        params.push(severity);
        paramIndex++;
      }
      
      query += ` ORDER BY r.created_at DESC`;
    }
    
    query += ` LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await client.query(query, params);
    
    // Группируем по severity для удобства
    const risks = result.rows;
    const grouped = {
      critical: risks.filter(r => r.severity === 'critical'),
      warning: risks.filter(r => r.severity === 'warning'),
      attention: risks.filter(r => r.severity === 'attention'),
    };
    
    return res.status(200).json({
      risks: risks,
      grouped,
      summary: {
        total: risks.length,
        critical: grouped.critical.length,
        warning: grouped.warning.length,
        attention: grouped.attention.length,
      },
    });
  } catch (error) {
    if (isDev) console.error('Risks list error:', error);
    
    // Если таблица не существует, возвращаем пустой массив
    if (error.code === '42P01') { // undefined_table
      return res.status(200).json({
        risks: [],
        grouped: { critical: [], warning: [], attention: [] },
        summary: { total: 0, critical: 0, warning: 0, attention: 0 },
        message: 'Table tour_risks not found. Run migration first.',
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to fetch risks',
      error: isDev ? error.message : undefined,
    });
  } finally {
    client.release();
  }
}
