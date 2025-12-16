// pages/company/[id]/operations.js — Operations Page for Owner
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Layout
import OwnerSidebar from '../../../components/owner/layout/OwnerSidebar';
import OwnerHeader from '../../../components/owner/layout/OwnerHeader';

// Operations components
import OperationsFilterBar from '../../../components/owner/operations/OperationsFilterBar';
import OperationsStats from '../../../components/owner/operations/OperationsStats';
import CriticalWarningsBanner from '../../../components/owner/operations/CriticalWarningsBanner';
import ToursTable from '../../../components/owner/operations/ToursTable';

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
    console.error('Operations page error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

export default function OperationsPage({ company, user }) {
  const router = useRouter();
  const { id: companyId } = router.query;

  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleCreate = () => {
    console.log('Create tour clicked');
  };

  const handleOpenWarningsList = () => {
    console.log('Open warnings list');
  };

  const handleTourClick = (tour) => {
    console.log('Tour clicked:', tour);
  };

  return (
    <>
      <Head>
        <title>Операции - {company.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <div className="bg-[#f8fafc] text-slate-900 font-['Inter',sans-serif] antialiased overflow-hidden h-screen flex">
        {/* Sidebar */}
        <OwnerSidebar companyId={companyId} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f8fafc]">
          {/* Header */}
          <OwnerHeader
            companyName={company.name}
            userName={user.name}
            userRole={user.role}
          />

          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1440px] mx-auto p-6 flex flex-col gap-6">
              {/* Page Title */}
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900">Операции</h2>
                <p className="text-slate-500 text-sm">Выезды, готовность, риски и контроль исполнения</p>
              </div>

              {/* Filter Bar */}
              <OperationsFilterBar
                onFilterChange={handleFilterChange}
                onExport={handleExport}
                onCreate={handleCreate}
              />

              {/* Stats Cards */}
              <OperationsStats />

              {/* Critical Warnings Banner */}
              <CriticalWarningsBanner onOpenList={handleOpenWarningsList} />

              {/* Tours Table */}
              <ToursTable onTourClick={handleTourClick} />

              {/* Bottom Spacer */}
              <div className="h-8"></div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-size: 20px;
          line-height: 1;
        }
        .icon-fill {
          font-variation-settings: 'FILL' 1;
        }
      `}</style>
    </>
  );
}
