import Link from 'next/link';
import { useRouter } from 'next/router';

export default function OwnerSidebar({ companyId }) {
  const router = useRouter();
  
  // Определяем активную вкладку по pathname
  const getActiveTab = () => {
    const path = router.pathname;
    if (path.includes('/operations')) return 'operations';
    if (path.includes('/finances')) return 'finances';
    if (path.includes('/team')) return 'team';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard'; // owner.js = dashboard
  };
  
  const activeTab = getActiveTab();
  
  // Базовый путь зависит от того, есть ли companyId
  const basePath = companyId ? `/company/${companyId}` : '/owner';
  
  const navItems = [
    { href: companyId ? `${basePath}/owner` : `${basePath}/dashboard`, key: 'dashboard', label: 'Главная', icon: 'dashboard' },
    { href: `${basePath}/operations`, key: 'operations', label: 'Операции', icon: 'bar_chart' },
    { href: `${basePath}/finances`, key: 'finances', label: 'Финансы', icon: 'payments' },
    { href: `${basePath}/team`, key: 'team', label: 'Команда', icon: 'groups' },
  ];
  
  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#f0f0f4] flex flex-col justify-between h-full z-20 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-[#f0f0f4]">
          <div className="flex items-center gap-2 text-[#1313ec]">
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: '28px' }}>route</span>
            <span className="text-lg font-bold tracking-tight text-[#111118]">Git-Kit</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors ${
                  isActive
                    ? 'bg-[#1313ec]/10 text-[#1313ec]'
                    : 'text-[#616189] hover:bg-[#f0f0f4] hover:text-[#111118]'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Settings at bottom */}
          <div className="mt-auto pt-4 border-t border-[#f0f0f4] mb-2">
            <Link
              href={`${basePath}/settings`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#1313ec]/10 text-[#1313ec]'
                  : 'text-[#616189] hover:bg-[#f0f0f4] hover:text-[#111118]'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Настройки</span>
            </Link>
          </div>
        </nav>
        
        {/* Bottom Status */}
        <div className="p-4 border-t border-[#f0f0f4] bg-[#fafafa]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500"></div>
              <p className="text-[#616189] text-xs font-medium">Active until 12 Jan 2026</p>
            </div>
            <button className="flex w-full cursor-pointer items-center justify-center rounded-lg h-9 bg-white border border-[#e0e0e4] text-[#111118] text-sm font-semibold hover:bg-[#f0f0f4] transition-colors">
              Billing
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}



