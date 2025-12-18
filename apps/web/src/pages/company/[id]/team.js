// pages/company/[id]/team.js — Team Page for Owner
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Layout
import OwnerSidebar from '../../../components/owner/layout/OwnerSidebar';
import OwnerHeader from '../../../components/owner/layout/OwnerHeader';

// Team components
import TeamFilterBar from '../../../components/owner/team/TeamFilterBar';
import TeamManagersContent from '../../../components/owner/team/TeamManagersContent';
import TeamGuidesContent from '../../../components/owner/team/TeamGuidesContent';
import TeamStats from '../../../components/owner/team/TeamStats';
import PerformanceChart from '../../../components/owner/team/PerformanceChart';
import ServiceQualityWidget from '../../../components/owner/team/ServiceQualityWidget';
import EfficiencyTable from '../../../components/owner/team/EfficiencyTable';
import AttentionZones from '../../../components/owner/team/AttentionZones';
import TeamComposition from '../../../components/owner/team/TeamComposition';
import InviteUserModal from '../../../components/owner/team/InviteUserModal';

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

    if (!roleRes.rows[0]) {
      return { redirect: { destination: '/cabinet', permanent: false } };
    }

    const role = roleRes.rows[0].role;

    // Только owner имеет доступ
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
  } catch (e) {
    console.error('Team page error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

export default function TeamPage({ company, user }) {
  const router = useRouter();
  const { id: companyId } = router.query;
  const [activeRole, setActiveRole] = useState('all');
  const [period, setPeriod] = useState('30days');
  const [search, setSearch] = useState('');
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [overviewVersion, setOverviewVersion] = useState(0);

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  useEffect(() => {
    const loadOverview = async () => {
      if (!companyId) return;
      if (activeRole !== 'all') return;

      try {
        const url = `/api/v1/owner/team-overview?companyId=${companyId}&period=${period}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setOverview(data);
      } catch (e) {
        console.error('Failed to load team overview', e);
      }
    };

    loadOverview();
  }, [companyId, period, activeRole, overviewVersion]);

  const formatNumber = (value) => {
    try {
      return new Intl.NumberFormat('ru-RU').format(value);
    } catch {
      return String(value);
    }
  };

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7days':
        return 'за 7 дней';
      case '30days':
        return 'за 30 дней';
      case 'quarter':
        return 'за 90 дней';
      case 'custom':
        return 'за период';
      default:
        return 'за 30 дней';
    }
  }, [period]);

  const teamStats = useMemo(() => {
    if (!overview) return null;

    const employees = overview.employees || {};
    const sales = overview.sales || {};
    const service = overview.service || {};
    const avgRating =
      typeof service.avgRating === 'number' ? service.avgRating.toFixed(1) : '—';

    const employeesSub = [
      `Админы: ${formatNumber(Number(employees.admins || 0))}`,
      `Менеджеры: ${formatNumber(Number(employees.managers || 0))}`,
      `Гиды: ${formatNumber(Number(employees.guides || 0))}`,
    ].join(' • ');

    return [
      {
        id: 'employees',
        label: 'Активные сотрудники',
        value: formatNumber(Number(employees.total || 0)),
        subtext: employeesSub,
        icon: 'badge',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
      },
      {
        id: 'sales',
        label: 'Продажи',
        value: formatNumber(Number(sales.people || 0)),
        subtext: periodLabel,
        icon: 'shopping_cart',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        id: 'rating',
        label: 'Оценка сервиса',
        value: avgRating,
        subtext: `На основе ${formatNumber(Number(service.ratingsCount || 0))} отзывов`,
        icon: 'star',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
      {
        id: 'complaints',
        label: 'Жалобы',
        value: formatNumber(Number(service.complaints || 0)),
        subtext: `${formatNumber(Number(service.unresolved || 0))} не решены`,
        icon: 'report_problem',
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
      },
    ];
  }, [overview, periodLabel]);

  return (
    <>
      <Head>
        <title>Команда - {company.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <div className="bg-[#f6f6f8] text-[#111118] font-['Inter',sans-serif] antialiased overflow-hidden h-screen flex">
        {/* Sidebar */}
        <OwnerSidebar companyId={companyId} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f6f6f8]">
          {/* Header */}
          <OwnerHeader
            companyName={company.name}
            userName={user.name}
            userRole={user.role}
          />

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1440px] mx-auto p-6 md:p-8 flex flex-col gap-6">
              {/* Filter Bar */}
              <TeamFilterBar
                onExport={handleExport}
                onInvite={handleInvite}
                activeRole={activeRole}
                onFilterChange={(filter) => {
                  if (filter?.period) setPeriod(filter.period);
                  if (typeof filter?.search === 'string') setSearch(filter.search);
                }}
                onRoleChange={(role) => {
                  if (role === activeRole) return;
                  setActiveRole(role);
                  setIsCreateManagerOpen(false);
                  setIsCreateGuideOpen(false);
                }}
              />

              {activeRole === 'managers' ? (
                <TeamManagersContent
                  companyId={companyId}
                  period={period}
                  search={search}
                  isCreateManagerOpen={isCreateManagerOpen}
                  onCloseCreateManager={() => setIsCreateManagerOpen(false)}
                />
              ) : activeRole === 'guides' ? (
                <TeamGuidesContent
                  companyId={companyId}
                  period={period}
                  search={search}
                  isCreateGuideOpen={isCreateGuideOpen}
                  onCloseCreateGuide={() => setIsCreateGuideOpen(false)}
                />
              ) : (
                <>
                  {/* KPI Stats */}
                  <TeamStats stats={teamStats || undefined} />

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PerformanceChart
                      series={overview?.sales?.series}
                      prevSeries={overview?.sales?.prevSeries}
                    />
                    <ServiceQualityWidget
                      avgRating={overview?.service?.avgRating}
                      ratingsCount={overview?.service?.ratingsCount}
                      breakdown={overview?.service?.breakdown}
                      complaints={overview?.service?.complaints}
                      unresolved={overview?.service?.unresolved}
                    />
                  </div>

                  {/* Efficiency Table */}
                  <EfficiencyTable
                    managers={overview?.topEfficiency?.managers}
                    guides={overview?.topEfficiency?.guides}
                  />

                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                    <AttentionZones />
                    <div className="flex flex-col gap-6">
                      <TeamComposition
                        admins={overview?.employees?.admins}
                        managers={overview?.employees?.managers}
                        guides={overview?.employees?.guides}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <InviteUserModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        companyId={companyId}
        onCreated={() => setOverviewVersion((v) => v + 1)}
      />
    </>
  );
}
