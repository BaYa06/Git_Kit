import { useState } from 'react';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import DesktopDashboard from '../dashboard/DesktopDashboard';
import ToursPage from '../tours/ToursPage';
import BasePage from '../base/BasePage';
import TemplatesPage from '../templates/TemplatesPage';
import { NewTourFromTemplateScreen } from '../../mobile/ToursTab';

export default function DesktopAdminLayout({ company, user, role, guides, hotels, drivers, tours, companyId }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTourId, setEditingTourId] = useState(null);

  // Mock stats data - replace with real data from API
  const stats = {
    activeTours: tours?.filter(t => t.status === 'confirmed' || t.status === 'active').length || 0,
    availableGuides: guides?.length || 0,
    totalGuides: guides?.length || 0,
    partnerHotels: hotels?.length || 0,
    occupancy: 85,
  };

  // Filter upcoming tours (next 3 days)
  const today = new Date();
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  const upcomingTours = tours?.filter(tour => {
    if (!tour.start_date) return false;
    const tourDate = new Date(tour.start_date);
    return tourDate >= today && tourDate <= threeDaysLater;
  }) || [];

  // Mock alerts - replace with real alerts/risks from API
  const alerts = [];
  const risks = [];

  const handleTourClick = (tourId) => {
    setEditingTourId(tourId);
  };

  const handleShowAllTours = () => {
    setActiveTab('tours');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DesktopDashboard
            companyId={companyId}
            stats={stats}
            tours={upcomingTours}
            alerts={alerts}
            risks={risks}
            onTourClick={handleTourClick}
            onShowAllTours={handleShowAllTours}
          />
        );
      case 'tours':
        return (
          <ToursPage
            tours={tours}
            companyId={companyId}
            guides={guides}
            hotels={hotels}
            drivers={drivers}
          />
        );
      case 'base':
        return (
          <BasePage
            guides={guides}
            hotels={hotels}
            drivers={drivers}
            companyId={companyId}
          />
        );
      case 'templates':
        return (
          <TemplatesPage
            templates={[]} // TODO: load templates from API
            companyId={companyId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#111621]">
      <DesktopHeader company={company} user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar
          companyId={companyId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {renderContent()}
      </div>

      {/* Tour Editor */}
      <NewTourFromTemplateScreen
        open={!!editingTourId}
        templateId={null}
        companyId={companyId}
        guides={guides}
        hotels={hotels}
        drivers={drivers}
        mode="edit"
        tourId={editingTourId}
        onCreated={() => {
          // Reload page to refresh tours list
          window.location.reload();
        }}
        onClose={() => {
          setEditingTourId(null);
        }}
      />
    </div>
  );
}
