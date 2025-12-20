import { useState } from 'react';
import { useRouter } from 'next/router';

export default function DesktopSidebar({ companyId, activeTab, onTabChange }) {
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: 'dashboard', filled: true },
    { id: 'tours', label: 'Все туры', icon: 'map' },
    { id: 'base', label: 'База', icon: 'database' },
    { id: 'templates', label: 'Шаблоны', icon: 'content_copy' },
    { id: 'profile', label: 'Профиль', icon: 'person' },
  ];

  const handleLogout = () => {
    // TODO: implement logout logic
    router.push('/login');
  };

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-white/10 bg-[#111621] p-4 shrink-0 overflow-y-auto hidden md:flex">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={`group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span 
              className="material-symbols-outlined"
              style={item.filled && activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <button
          className={`group flex items-center gap-3 rounded-full px-4 py-3 transition-all ${
            activeTab === 'help'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
          onClick={() => onTabChange?.('help')}
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm font-medium">Помощь</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="group flex items-center gap-3 rounded-full px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  );
}
