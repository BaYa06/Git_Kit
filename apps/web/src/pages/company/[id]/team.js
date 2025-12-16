// pages/company/[id]/team.js — Team Page for Owner
import Head from 'next/head';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Layout
import OwnerSidebar from '../../../components/owner/layout/OwnerSidebar';
import OwnerHeader from '../../../components/owner/layout/OwnerHeader';

// Team components
import TeamFilterBar from '../../../components/owner/team/TeamFilterBar';
import TeamStats from '../../../components/owner/team/TeamStats';
import PerformanceChart from '../../../components/owner/team/PerformanceChart';
import ServiceQualityWidget from '../../../components/owner/team/ServiceQualityWidget';
import EfficiencyTable from '../../../components/owner/team/EfficiencyTable';
import AttentionZones from '../../../components/owner/team/AttentionZones';
import TeamComposition from '../../../components/owner/team/TeamComposition';
import WorkloadWidget from '../../../components/owner/team/WorkloadWidget';

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

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleInvite = () => {
    console.log('Invite clicked');
  };

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
              <TeamFilterBar onExport={handleExport} onInvite={handleInvite} />

              {/* KPI Stats */}
              <TeamStats />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PerformanceChart />
                <ServiceQualityWidget />
              </div>

              {/* Efficiency Table */}
              <EfficiencyTable />

              {/* Bottom Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                <AttentionZones />
                <div className="flex flex-col gap-6">
                  <TeamComposition />
                  <WorkloadWidget />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
