// pages/company/[id]/settings.js — Settings Page for Owner
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Layout
import OwnerSidebar from '../../../components/owner/layout/OwnerSidebar';
import OwnerHeader from '../../../components/owner/layout/OwnerHeader';

// Settings components
import SettingsSidebar from '../../../components/owner/settings/SettingsSidebar';
import SettingsHeader from '../../../components/owner/settings/SettingsHeader';
import CompanyProfileCard from '../../../components/owner/settings/CompanyProfileCard';
import BrandingCard from '../../../components/owner/settings/BrandingCard';
import OperationalParamsCard from '../../../components/owner/settings/OperationalParamsCard';
import EmergencyContactsCard from '../../../components/owner/settings/EmergencyContactsCard';
import SettingsInfoCards from '../../../components/owner/settings/SettingsInfoCards';

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
    console.error('Settings page error:', e);
    return { redirect: { destination: '/login', permanent: false } };
  }
}

export default function SettingsPage({ company, user }) {
  const router = useRouter();
  const { id: companyId } = router.query;

  const [activeSection, setActiveSection] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleReset = () => {
    setHasChanges(false);
    // TODO: Reset form data
  };

  const handleSave = () => {
    // TODO: Save settings
    setHasChanges(false);
  };

  return (
    <>
      <Head>
        <title>Настройки - {company.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #1313ec;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #1313ec;
        }
      `}</style>

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
            <div className="max-w-[1320px] mx-auto p-6 md:p-8">
              {/* Settings Header */}
              <SettingsHeader
                hasChanges={hasChanges}
                onReset={handleReset}
                onSave={handleSave}
              />

              {/* Settings Content */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Settings Navigation */}
                <SettingsSidebar
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />

                {/* Settings Forms */}
                <div className="flex-1 w-full grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Main Column */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    {activeSection === 'profile' && (
                      <>
                        <CompanyProfileCard company={company} onChange={handleChange} />
                        <BrandingCard 
                          companyId={company.id} 
                          logoUrl={company.logoUrl} 
                          onChange={handleChange} 
                        />
                        <OperationalParamsCard onChange={handleChange} />
                        <EmergencyContactsCard onChange={handleChange} />
                      </>
                    )}

                    {activeSection === 'users' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Пользователи и роли</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}

                    {activeSection === 'billing' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Биллинг и план</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}

                    {activeSection === 'integrations' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Интеграции</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}

                    {activeSection === 'notifications' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Уведомления</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}

                    {activeSection === 'security' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Безопасность</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}

                    {activeSection === 'export' && (
                      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
                        <h3 className="text-lg font-bold text-[#111118] mb-1">Экспорт и данные</h3>
                        <p className="text-sm text-[#616189]">Раздел в разработке</p>
                      </div>
                    )}
                  </div>

                  {/* Info Cards Column */}
                  <SettingsInfoCards
                    lastModifiedBy={user.name}
                    lastModifiedAt="Сегодня, 10:42 AM"
                  />
                </div>
              </div>

              <div className="h-12" />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
