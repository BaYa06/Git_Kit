import { useState } from 'react';

export default function SettingsSidebar({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'profile', label: 'Профиль компании', icon: 'domain' },
    { id: 'users', label: 'Пользователи и роли', icon: 'manage_accounts' },
    { id: 'billing', label: 'Биллинг и план', icon: 'credit_card' },
    { id: 'integrations', label: 'Интеграции', icon: 'integration_instructions' },
    { id: 'notifications', label: 'Уведомления', icon: 'notifications_active' },
    { id: 'security', label: 'Безопасность', icon: 'verified_user' },
    { id: 'export', label: 'Экспорт и данные', icon: 'database' },
  ];

  return (
    <nav className="w-full lg:w-60 flex-shrink-0 flex flex-col gap-1 sticky top-0">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-left ${
              isActive
                ? 'bg-white border border-[#e0e0e4] shadow-sm text-primary ring-1 ring-primary/10'
                : 'text-[#616189] hover:bg-white hover:text-[#111118] hover:shadow-sm'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'icon-fill' : ''}`}>
              {section.icon}
            </span>
            <span className="text-sm">{section.label}</span>
          </button>
        );
      })}

      <div className="mt-8 px-3 border-t border-[#f0f0f4] pt-4">
        <p className="text-xs text-[#9ca3af] font-medium">Версия приложения 2.4.0</p>
        <div className="flex gap-2 mt-1">
          <a className="text-xs text-primary hover:underline" href="#">
            Политика
          </a>
          <span className="text-xs text-[#cbd5e1]">•</span>
          <a className="text-xs text-primary hover:underline" href="#">
            Условия
          </a>
        </div>
      </div>
    </nav>
  );
}
