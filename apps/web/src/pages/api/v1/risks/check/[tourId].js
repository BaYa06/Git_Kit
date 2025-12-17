/**
 * API endpoint: POST /api/v1/risks/check/:tourId
 * Проверить риски конкретного тура
 */

import jwt from 'jsonwebtoken';
// checkTourRisks импортируется динамически ниже

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  return pair ? decodeURIComponent(pair.split('=')[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const { tourId } = req.query;
  const { companyId } = req.body || {};

  if (!tourId) {
    return res.status(400).json({ message: 'tourId is required' });
  }

  try {
    const { checkTourRisks } = await import('../../../../../lib/riskEngine');
    const risks = await checkTourRisks(tourId, companyId);
    
    return res.status(200).json({
      tour_id: tourId,
      risks,
      summary: {
        total: risks.length,
        critical: risks.filter(r => r.severity === 'critical').length,
        warning: risks.filter(r => r.severity === 'warning').length,
        attention: risks.filter(r => r.severity === 'attention').length,
      },
    });
  } catch (error) {
    if (isDev) console.error('Risk check error:', error);
    return res.status(500).json({ 
      message: 'Failed to check risks',
      error: isDev ? error.message : undefined,
    });
  }
}
