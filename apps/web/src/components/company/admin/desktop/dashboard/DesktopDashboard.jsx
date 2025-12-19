import { useState } from 'react';
import DesktopKPICards from './DesktopKPICards';
import DesktopUpcomingTours from './DesktopUpcomingTours';
import DesktopQuickActions from './DesktopQuickActions';
import DesktopAlerts from './DesktopAlerts';

export default function DesktopDashboard({ companyId, stats, tours, alerts, risks, onTourClick, onShowAllTours }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
      <div className="mx-auto max-w-[1200px] flex flex-col gap-8">
        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearch}>
            <label className="relative flex h-12 w-full items-center">
              <span className="material-symbols-outlined absolute left-4 text-gray-400">
                search
              </span>
              <input
                className="h-full w-full rounded-full border border-white/10 bg-[rgba(31,41,55,0.5)] pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="Быстрый поиск по турам, гидам или отелям..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </form>
        </div>

        {/* KPI Cards */}
        <DesktopKPICards stats={stats} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upcoming Tours (8 cols) */}
          <DesktopUpcomingTours 
            companyId={companyId} 
            onTourClick={onTourClick}
            onShowAllTours={onShowAllTours}
          />

          {/* Right Column: Widgets (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DesktopQuickActions companyId={companyId} />
            <DesktopAlerts alerts={alerts} risks={risks} />
          </div>
        </div>
      </div>
    </main>
  );
}
