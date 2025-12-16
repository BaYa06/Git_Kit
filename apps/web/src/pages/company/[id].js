// pages/company/[id].js — роутер по роли пользователя
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

export async function getServerSideProps({ req, params }) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  
  if (!pair) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret_change_me'
    );

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Получаем роль пользователя в этой компании
    const roleRes = await pool.query(
      'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
      [payload.sub, params.id]
    );

    await pool.end();

    // Если нет роли — нет доступа
    if (!roleRes.rows[0]) {
      return { redirect: { destination: '/cabinet', permanent: false } };
    }

    const role = roleRes.rows[0].role;

    // Редирект на нужную страницу в зависимости от роли
    const roleRoutes = {
      owner: `/company/${params.id}/owner`,
      admin: `/company/${params.id}/admin`,
      coordinator: `/company/${params.id}/admin`,
      manager: `/company/${params.id}/manager`,
      guide: `/company/${params.id}/guide`,
      readonly: `/company/${params.id}/admin`,
    };

    const destination = roleRoutes[role] || `/company/${params.id}/admin`;

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  } catch (e) {
    console.error('Company redirect error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

// Этот компонент не рендерится — всегда редирект
export default function CompanyRedirect() {
  return null;
}
