import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OwnerLayout from '@/components/owner/dashboard/OwnerLayout';
import FilterBar from '@/components/owner/dashboard/FilterBar';
import KPIRow from '@/components/owner/dashboard/KPIRow';
import AlertsWidget from '@/components/owner/dashboard/AlertsWidget';
import UpcomingTripsTable from '@/components/owner/dashboard/UpcomingTripsTable';
import RevenueChart from '@/components/owner/dashboard/RevenueChart';
import DestinationsChart from '@/components/owner/dashboard/DestinationsChart';
import TeamTable from '@/components/owner/dashboard/TeamTable';
import QuickActions from '@/components/owner/dashboard/QuickActions';
import FocusTasks from '@/components/owner/dashboard/FocusTasks';

export default function OwnerDashboard() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(null);

  // Получаем ID компании из контекста пользователя
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        const res = await fetch('/api/v1/profile/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Предполагается что API возвращает company_id или берём из первой компании
          setCompanyId(data.company_id || data.companies?.[0]?.id);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };
    
    fetchUserCompany();
  }, []);
  const handlePeriodChange = (period) => {
    console.log('Period changed:', period);
  };
  
  const handleExport = () => {
    console.log('Export clicked');
  };
  
  const handleAlertAction = (risk) => {
    console.log('Risk action:', risk);
    // Переход к туру для исправления риска
    if (risk.tour_id) {
      router.push(`/company/${companyId}/tours/${risk.tour_id}`);
    }
  };
  
  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
  };
  
  const handleAddTask = () => {
    console.log('Add task clicked');
  };
  
  return (
    <OwnerLayout title="Главная" companyName="Avangard Travel">
      {/* Filter Bar */}
      <FilterBar 
        onPeriodChange={handlePeriodChange}
        onExport={handleExport}
      />
      
      {/* KPI Row */companyId={companyId} }
      <KPIRow />
      
      {/* Critical Alerts */}
      <AlertsWidget onAction={handleAlertAction} />
      
      {/* Upcoming Trips Table */}
      <UpcomingTripsTable />
      
      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueChart />
        </div>
        <div className="lg:col-span-4">
          <DestinationsChart />
        </div>
      </div>
      
      {/* Team & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TeamTable />
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
    </OwnerLayout>
  );
}
