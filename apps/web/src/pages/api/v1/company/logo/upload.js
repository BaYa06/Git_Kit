// pages/api/v1/company/logo/upload.js
import { put, del } from '@vercel/blob';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false, // Отключаем парсер для работы с FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Проверка авторизации
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  
  if (!pair) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let userId;
  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    userId = payload.sub;
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Получаем companyId из query
  const { companyId } = req.query;
  
  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Проверяем, что пользователь — owner этой компании
    const roleRes = await pool.query(
      'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
      [userId, companyId]
    );

    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'owner') {
      await pool.end();
      return res.status(403).json({ error: 'Only owner can change company logo' });
    }

    // Получаем текущий логотип для удаления
    const currentLogo = await pool.query(
      'SELECT logo_url FROM companies WHERE id = $1',
      [companyId]
    );
    const oldLogoUrl = currentLogo.rows[0]?.logo_url;

    // Читаем файл из request
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Парсим multipart/form-data вручную
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
      await pool.end();
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Извлекаем файл из multipart данных
    const parts = buffer.toString('binary').split(`--${boundary}`);
    let fileBuffer = null;
    let fileName = 'logo.png';
    let fileMimeType = 'image/png';

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('filename=')) {
        // Извлекаем имя файла
        const filenameMatch = part.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          fileName = filenameMatch[1];
        }

        // Извлекаем content-type
        const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
        if (contentTypeMatch) {
          fileMimeType = contentTypeMatch[1].trim();
        }

        // Находим начало данных файла (после двух переносов строки)
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        
        if (dataStart > 3 && dataEnd > dataStart) {
          const fileData = part.slice(dataStart, dataEnd);
          fileBuffer = Buffer.from(fileData, 'binary');
        }
      }
    }

    if (!fileBuffer) {
      await pool.end();
      return res.status(400).json({ error: 'No file provided' });
    }

    // Проверяем размер (макс 2MB)
    if (fileBuffer.length > 2 * 1024 * 1024) {
      await pool.end();
      return res.status(400).json({ error: 'File too large. Max 2MB' });
    }

    // Проверяем тип файла
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(fileMimeType)) {
      await pool.end();
      return res.status(400).json({ error: 'Invalid file type. Allowed: PNG, JPG, WEBP, SVG' });
    }

    // Загружаем в Vercel Blob
    const ext = fileName.split('.').pop() || 'png';
    const blobFileName = `company-logos/${companyId}/logo-${Date.now()}.${ext}`;
    
    const blob = await put(blobFileName, fileBuffer, {
      access: 'public',
      contentType: fileMimeType,
    });

    // Сохраняем URL в базу данных
    await pool.query(
      'UPDATE companies SET logo_url = $1 WHERE id = $2',
      [blob.url, companyId]
    );

    // Удаляем старый логотип из Blob (если он был в Vercel Blob)
    if (oldLogoUrl && oldLogoUrl.includes('vercel-storage.com')) {
      try {
        await del(oldLogoUrl);
      } catch (e) {
        console.log('Could not delete old logo:', e.message);
      }
    }

    await pool.end();

    return res.status(200).json({
      success: true,
      logoUrl: blob.url,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    await pool.end();
    return res.status(500).json({ error: 'Failed to upload logo' });
  }
}
