import { useEffect, useState } from 'react';
import InviteUserModal from '../../../../owner/team/InviteUserModal';
import GuidesTab from './GuidesTab';
import HotelsTab from './HotelsTab';
import TransportTab from './TransportTab';

export default function BasePage({ guides, hotels, drivers, companyId }) {
  const [activeTab, setActiveTab] = useState('guides');
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleAddClick = () => {
    if (activeTab === 'guides') {
      setInviteOpen(true);
    }
  };

  useEffect(() => {
    if (activeTab !== 'guides' && inviteOpen) {
      setInviteOpen(false);
    }
  }, [activeTab, inviteOpen]);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">База</h1>
            <p className="text-sm text-gray-400">Справочники компании: гиды, отели и локации.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              {activeTab === 'transport' ? 'Экспорт CSV' : 'Экспорт'}
            </button>
            <div className="relative flex">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                {activeTab === 'transport' ? 'Добавить транспорт' : activeTab === 'hotels' ? 'Добавить отель' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center border-b border-white/10 bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('guides')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'guides'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Гиды
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {guides?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'hotels'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">hotel</span>
              Отели
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {hotels?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'transport'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              Транспорт
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {drivers?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'guides' && <GuidesTab guides={guides} />}
        {activeTab === 'hotels' && <HotelsTab hotels={hotels} />}
        {activeTab === 'transport' && <TransportTab drivers={drivers} />}
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        companyId={companyId}
        allowedRoles={['guide']}
        variant="dark"
      />
    </main>
  );
}
