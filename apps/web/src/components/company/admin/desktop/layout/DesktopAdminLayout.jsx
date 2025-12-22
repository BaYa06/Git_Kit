import { useState, useEffect } from 'react';
import DesktopHeader from './DesktopHeader';
import DesktopSidebar from './DesktopSidebar';
import DesktopDashboard from '../dashboard/DesktopDashboard';
import ToursPage from '../tours/ToursPage';
import BasePage from '../base/BasePage';
import TemplatesPage from '../templates/TemplatesPage';
import { HelpPage } from '../help';
import { ProfilePage } from '../profile';
import { NewTourFromTemplateScreen, TemplatePickerModal } from '../../mobile/ToursTab';

export default function DesktopAdminLayout({ company, user, role, guides, hotels, drivers, tours, companyId }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTourId, setEditingTourId] = useState(null);
  
  // Template picker states
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [newTourOpen, setNewTourOpen] = useState(false);
  const [newTourTemplateId, setNewTourTemplateId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);

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

  // Load templates
  useEffect(() => {
    if (!companyId) return;
    
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const response = await fetch(`/api/v1/company/templates/list?company_id=${companyId}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Не удалось загрузить шаблоны');
        }
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplatesError(error.message);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [companyId]);

  const handleTemplatePicked = (template) => {
    if (!template) return;
    setNewTourTemplateId(template.id);
    setEditingTourId(null);
    setTemplatePickerOpen(false);
    setNewTourOpen(true);
  };

  const handleCreateTour = () => {
    setTemplatePickerOpen(true);
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
            templates={templates}
            companyId={companyId}
          />
        );
      case 'help':
        return <HelpPage />;
      case 'profile':
        return <ProfilePage view="work" user={user} role={role} company={company} />;
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

      {/* Template Picker Modal */}
      <TemplatePickerModal
        open={templatePickerOpen}
        templates={templates}
        loading={templatesLoading}
        error={templatesError}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectTemplate={handleTemplatePicked}
      />

      {/* New Tour Modal */}
      <NewTourFromTemplateScreen
        open={newTourOpen}
        templateId={newTourTemplateId}
        companyId={companyId}
        guides={guides}
        hotels={hotels}
        drivers={drivers}
        mode="create"
        tourId={null}
        onCreated={() => {
          // Reload page to refresh tours list
          window.location.reload();
        }}
        onClose={() => {
          setNewTourOpen(false);
          setNewTourTemplateId(null);
        }}
      />

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
