import { useMemo, useState } from 'react';
import ProfileCard from './ProfileCard';
import ProfileHero from './ProfileHero';
import ProfileTabs from './ProfileTabs';
import PersonalCard from './PersonalCard';
import ContactsCard from './ContactsCard';
import SecurityCard from './SecurityCard';
import WorkTabs from './work/WorkTabs';
import RoleCard from './work/RoleCard';
import PermissionsCard from './work/PermissionsCard';
import ManagerNote from './work/ManagerNote';
import SmallStats from './work/SmallStats';
import ActivityFeed from './work/ActivityFeed';
import WorkHistory from './work/WorkHistory';
import SalaryDetails from './salary/SalaryDetails';
import SalaryHistory from './salary/SalaryHistory';
import { profileData } from './data';

export default function ProfilePage({ view = 'work', user }) {
  const [activeTab, setActiveTab] = useState(view === 'work' ? 'work' : 'main');
  const showWork = activeTab === 'work';
  const showSalary = activeTab === 'salary';
  const resolvedProfile = useMemo(() => {
    const fullName =
      [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
      user?.name ||
      user?.email ||
      profileData.fullName;

    return {
      ...profileData,
      name: fullName,
      fullName,
      contacts: {
        ...profileData.contacts,
        email: user?.email || profileData.contacts.email,
        phone: user?.phone || profileData.contacts.phone,
      },
    };
  }, [user]);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
      <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
        {/* Общая карточка профиля для всех вкладок */}
        <ProfileCard data={resolvedProfile} />
        
        {/* Единая навигация по табам */}
        <WorkTabs active={activeTab} onChange={setActiveTab} />
        
        {/* Контент в зависимости от активной вкладки */}
        {showWork ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <RoleCard work={profileData.work} />
                <PermissionsCard work={profileData.work} />
                <ManagerNote note={profileData.work.managerNote} />
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                <SmallStats stats={profileData.work.stats} />
                <ActivityFeed activities={profileData.work.activities} />
              </div>
            </div>
            <WorkHistory history={profileData.work.history} />
          </>
        ) : showSalary ? (
          <>
            <SalaryDetails salary={profileData.salary} />
            <SalaryHistory history={profileData.salary.history} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonalCard
                data={{
                  fullName: resolvedProfile.fullName,
                  birthDate: resolvedProfile.personal.birthDate,
                  city: resolvedProfile.personal.city,
                  languages: resolvedProfile.personal.languages,
                }}
              />
              <ContactsCard data={resolvedProfile.contacts} />
            </div>
            <SecurityCard data={resolvedProfile.security} />
          </>
        )}
      </div>
    </main>
  );
}
