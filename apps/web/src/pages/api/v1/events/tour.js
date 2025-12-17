/**
 * SSE Endpoint для подписки на события тура
 * 
 * GET /api/v1/events/tour?tour_id=123
 * 
 * Клиент подключается и получает real-time обновления:
 * - guests_updated — список туристов изменился
 * - tour_updated — данные тура изменились
 * - heartbeat — keepalive каждые 30 сек
 */

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import eventHub from '../../../../lib/eventHub';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  return pair ? decodeURIComponent(pair.split('=')[1]) : null;
}

// Отключаем body parsing для SSE
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    if (isDev) console.error('SSE JWT verify error:', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const { tour_id } = req.query;
  if (!tour_id) {
    return res.status(400).json({ message: 'tour_id обязателен' });
  }

  // Проверяем доступ к туру
  const client = await pool.connect();
  try {
    const tourRes = await client.query(
      `SELECT company_id FROM tours WHERE id = $1 LIMIT 1`,
      [tour_id]
    );
    
    if (tourRes.rowCount === 0) {
      return res.status(404).json({ message: 'Тур не найден' });
    }

    const { company_id } = tourRes.rows[0];

    const perm = await client.query(
      `SELECT role FROM user_company_roles 
       WHERE user_id = $1 AND company_id = $2 
       LIMIT 1`,
      [auth.sub, company_id]
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: 'Нет доступа к этому туру' });
    }

    const userRole = perm.rows[0].role;

    // Настраиваем SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Для nginx
    res.flushHeaders();

    // Отправляем приветственное сообщение
    const welcomeData = {
      message: 'Connected to tour events',
      tour_id,
      user_id: auth.sub,
      role: userRole,
      timestamp: Date.now(),
    };
    res.write(`event: connected\ndata: ${JSON.stringify(welcomeData)}\n\n`);

    // Подписываемся на канал тура
    const channel = `tour:${tour_id}`;
    const subscriber = eventHub.subscribe(channel, res, auth.sub);

    // Также подписываемся на канал компании (для глобальных событий)
    const companyChannel = `company:${company_id}`;
    const companySubscriber = eventHub.subscribe(companyChannel, res, auth.sub);

    if (isDev) {
      console.log(`[SSE] User ${auth.sub} connected to tour ${tour_id}`);
    }

    // Обработка закрытия соединения
    req.on('close', () => {
      eventHub.unsubscribe(channel, subscriber);
      eventHub.unsubscribe(companyChannel, companySubscriber);
      if (isDev) {
        console.log(`[SSE] User ${auth.sub} disconnected from tour ${tour_id}`);
      }
    });

    // Держим соединение открытым
    // Next.js сам закроет его когда клиент отключится

  } catch (e) {
    if (isDev) console.error('SSE setup error:', e);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
}
