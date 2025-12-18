// pages/company/[id]/owner.js — Owner Dashboard
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Layout компоненты
import OwnerSidebar from '../../../components/owner/layout/OwnerSidebar';
import OwnerHeader from '../../../components/owner/layout/OwnerHeader';

// Dashboard компоненты
import FilterBar from '../../../components/owner/dashboard/FilterBar';
import KPIRow from '../../../components/owner/dashboard/KPIRow';
import AlertsWidget from '../../../components/owner/dashboard/AlertsWidget';
import UpcomingTripsTable from '../../../components/owner/dashboard/UpcomingTripsTable';
import RevenueChart from '../../../components/owner/dashboard/RevenueChart';
import DestinationsChart from '../../../components/owner/dashboard/DestinationsChart';
import TeamTable from '../../../components/owner/dashboard/TeamTable';
import QuickActions from '../../../components/owner/dashboard/QuickActions';
import FocusTasks from '../../../components/owner/dashboard/FocusTasks';

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

    // Параллельно загружаем все данные
    const [companyRes, roleRes, userRes] = await Promise.all([
      // Компания
      pool.query('SELECT id, name, logo_url FROM companies WHERE id = $1', [params.id]),
      
      // Роль пользователя
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1',
        [payload.sub, params.id]
      ),
      
      // Данные пользователя
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
      // Редирект на страницу соответствующую роли
      const roleRoutes = {
        admin: `/company/${params.id}/admin`,
        coordinator: `/company/${params.id}/admin`,
        manager: `/company/${params.id}/manager`,
        guide: `/company/${params.id}/guide`,
        readonly: `/company/${params.id}/admin`,
      };
      return {
        redirect: {
          destination: roleRoutes[role] || `/company/${params.id}/admin`,
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
  } catch (e) {
    console.error('Owner page error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

export default function OwnerDashboardPage({ company, user }) {
  const router = useRouter();
  const { id: companyId } = router.query;
  
  // Состояние для статистики
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('7days');
  const [revenueStats, setRevenueStats] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);

  // Загрузка статистики
  const fetchStats = async (selectedPeriod) => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/owner/dashboard-stats?companyId=${companyId}&period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async (selectedPeriod) => {
    if (!companyId) return;

    setRevenueLoading(true);
    try {
      const res = await fetch(`/api/v1/owner/dashboard-stats?companyId=${companyId}&period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setRevenueStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Загружаем данные при монтировании и смене периода
  useEffect(() => {
    fetchStats(period);
  }, [companyId, period]);

  useEffect(() => {
    fetchRevenueStats(revenuePeriod);
  }, [companyId, revenuePeriod]);

  useEffect(() => {
    const loadTrips = async () => {
      if (!companyId) return;
      setTripsLoading(true);
      try {
        const res = await fetch(`/api/v1/owner/upcoming-tours?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setTrips(Array.isArray(data.trips) ? data.trips : []);
        } else {
          setTrips([]);
        }
      } catch (e) {
        console.error('Failed to load upcoming tours', e);
        setTrips([]);
      } finally {
        setTripsLoading(false);
      }
    };
    loadTrips();
  }, [companyId]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleExport = () => {
    console.log('Export clicked');
    // TODO: реализовать экспорт
  };

  const handleAlertAction = (alert) => {
    console.log('Alert action:', alert);
    // TODO: обработать действие по алерту
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // TODO: реализовать быстрые действия
  };

  const handleAddTask = () => {
    console.log('Add task clicked');
    // TODO: модалка добавления задачи
  };

  const zeroSeriesForPeriod = (periodInfo) => {
    if (!periodInfo?.start || !periodInfo?.end) return [];
    const start = new Date(periodInfo.start);
    const end = new Date(periodInfo.end);
    const res = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      res.push({ date: key, value: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return res;
  };

  return (
    <>
      <Head>
        <title>Owner Dashboard - {company.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="bg-[#f6f6f8] text-[#111118] font-['Inter',sans-serif] antialiased overflow-hidden h-screen flex">
        {/* Sidebar */}
        <OwnerSidebar companyId={companyId} />
        
        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f6f6f8]">
          {/* Header */}
          <OwnerHeader 
            companyName={company.name} 
            userName={user.name}
            userRole={user.role}
          />
          
          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-8">
              {/* Filter Bar */}
              <FilterBar 
                onPeriodChange={handlePeriodChange}
                onExport={handleExport}
                activePeriod={period}
                lastUpdated={lastUpdated}
              />
              
              {/* KPI Row */}
              <KPIRow stats={stats} loading={loading} />
              
              {/* Critical Alerts */}
              <AlertsWidget companyId={companyId} onAction={handleAlertAction} />
              
              {/* Upcoming Trips Table */}
              <UpcomingTripsTable trips={trips} loading={tripsLoading} />
              
              {/* Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <RevenueChart
                    series={revenueStats?.revenueSeries && revenueStats.revenueSeries.length > 0
                      ? revenueStats.revenueSeries
                      : zeroSeriesForPeriod(revenueStats?.period)}
                    loading={revenueLoading}
                    periodLabel={
                      revenueStats?.period
                        ? `${revenueStats.period.start} — ${revenueStats.period.end}`
                        : ''
                    }
                    period={revenuePeriod}
                    onPeriodChange={setRevenuePeriod}
                  />
                </div>
                <div className="lg:col-span-4">
                  <DestinationsChart />
                </div>
              </div>
              
              {/* Team & Actions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <TeamTable companyId={companyId} />
                </div>
                <div className="lg:col-span-3">
                  <QuickActions onAction={handleQuickAction} />
                </div>
                <div className="lg:col-span-3">
                  <FocusTasks onAddTask={handleAddTask} />
                </div>
              </div>
              
              {/* Bottom Spacer */}
              <div className="h-8"></div>
            </div>
          </main>
        </div>
      </div>
      
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Material Icons */
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-size: 20px;
        }
        .icon-fill {
          font-variation-settings: 'FILL' 1;
        }
      `}</style>
    </>
  );
}
