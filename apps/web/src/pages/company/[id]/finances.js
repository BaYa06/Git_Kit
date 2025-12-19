import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OwnerSidebar from '@/components/owner/layout/OwnerSidebar';
import OwnerHeader from '@/components/owner/layout/OwnerHeader';
import FinancesFilterBar from '@/components/owner/finances/FinancesFilterBar';
import FinancesStats from '@/components/owner/finances/FinancesStats';
import RevenueChart from '@/components/owner/finances/RevenueChart';
import DebtStructure from '@/components/owner/finances/DebtStructure';
import RevenueByDestinations from '@/components/owner/finances/RevenueByDestinations';
import TopToursTable from '@/components/owner/finances/TopToursTable';
import FinancialRisksSummary from '@/components/owner/finances/FinancialRisksSummary';

export default function FinancesPage({ company, user }) {
  const router = useRouter();
  const { id } = router.query;
  const [period, setPeriod] = useState('7days');
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const loadFinances = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/owner/finances?companyId=${id}&period=${period}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setFinances(data);
          setUpdatedAt(new Date());
        } else {
          setFinances(null);
        }
      } catch (e) {
        console.error('Failed to load finances', e);
        setFinances(null);
      } finally {
        setLoading(false);
      }
    };
    loadFinances();
  }, [id, period]);

  return (
    <>
      <Head>
        <title>Финансы - {company?.name || 'Компания'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="bg-[#f6f6f8] text-[#111118] font-display antialiased overflow-hidden h-screen flex">
      {/* Sidebar */}
      <OwnerSidebar companyId={id} activeTab="finances" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f6f6f8]">
        {/* Header */}
        <OwnerHeader 
          companyName={company?.name || 'Загрузка...'} 
          user={user}
        />

        {/* Main */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1440px] mx-auto p-6 md:p-8 flex flex-col gap-8">
            {/* Filter Bar */}
            <FinancesFilterBar period={period} onPeriodChange={setPeriod} updatedAt={updatedAt} />

            {/* KPI Stats */}
            <FinancesStats stats={finances?.kpis} loading={loading} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue Chart (8 cols) */}
              <RevenueChart
                series={finances?.chart?.series}
                prevSeries={finances?.chart?.prevSeries}
                summary={finances?.chart?.summary}
                loading={loading}
              />

              {/* Right Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <DebtStructure />
              </div>
            </div>

            {/* Revenue by Destinations & Top Tours */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueByDestinations />
              <TopToursTable />
            </div>

            {/* Financial Risks Summary */}
            <FinancialRisksSummary />

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
    </>
  );
}

export async function getServerSideProps({ req, params }) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  
  if (!pair) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const jwt = require('jsonwebtoken');
    const { Pool } = require('pg');
    
    const token = decodeURIComponent(pair.split('=')[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret_change_me'
    );

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Параллельно загружаем все данные
    const [companyRes, roleRes, userRes] = await Promise.all([
      pool.query('SELECT id, name, logo_url FROM companies WHERE id = $1', [params.id]),
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
        [payload.sub, params.id]
      ),
      pool.query(
        'SELECT id, first_name, last_name, email FROM users WHERE id = $1 LIMIT 1',
        [payload.sub]
      ),
    ]);

    await pool.end();

    // Проверка доступа
    if (!roleRes.rows[0]) {
      return { redirect: { destination: '/cabinet', permanent: false } };
    }

    const role = roleRes.rows[0].role;
    
    // Только owner имеет доступ к этой странице
    if (role !== 'owner') {
      return {
        redirect: {
          destination: `/company/${params.id}`,
          permanent: false,
        },
      };
    }

    const company = companyRes.rows[0] || { id: params.id, name: 'Компания' };
    const user = userRes.rows[0] || {};
    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Owner';

    return {
      props: {
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logo_url || null,
        },
        user: {
          id: user.id,
          name: userName,
          email: user.email,
          role: 'Owner',
        },
      },
    };
  } catch (error) {
    console.error('Finances page error:', error);
    return { redirect: { destination: '/login', permanent: false } };
  }
}
