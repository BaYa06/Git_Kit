import OwnerLayout from '@/components/owner/layout/OwnerLayout';
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
  const handlePeriodChange = (period) => {
    console.log('Period changed:', period);
  };
  
  const handleExport = () => {
    console.log('Export clicked');
  };
  
  const handleAlertAction = (alert) => {
    console.log('Alert action:', alert);
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
      
      {/* KPI Row */}
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
