import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TemplatesPage({ templates = [], companyId }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTemplateClick = (templateId) => {
    // Navigate to template editor
    router.push(`/company/${companyId}/templates/${templateId}`);
  };

  const handleCreateTemplate = () => {
    router.push(`/company/${companyId}/templates/create`);
  };

  const handleUseTemplate = (templateId) => {
    // Create tour from template
    router.push(`/company/${companyId}/tours/create?template=${templateId}`);
  };

  // Mock data
  const mockTemplates = [
    {
      id: 1,
      name: 'Городской тур (стандарт)',
      description: 'Базовый шаблон для городских экскурсий',
      duration_days: 1,
      components_count: 5,
    },
    {
      id: 2,
      name: 'Многодневный тур',
      description: 'Шаблон для туров на несколько дней с проживанием',
      duration_days: 3,
      components_count: 12,
    },
  ];

  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Шаблоны туров</h1>
            <p className="text-sm text-gray-400 mt-1">Создавайте туры быстрее с помощью шаблонов</p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Создать шаблон
          </button>
        </div>

        {/* Search */}
        <div className="glass-card rounded-xl p-4">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Поиск шаблонов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-dark/50 border border-white/10 text-white text-sm placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTemplates.map((template) => (
            <div
              key={template.id}
              className="glass-card rounded-xl p-6 hover:bg-surface-dark/80 transition-all cursor-pointer group"
              onClick={() => handleTemplateClick(template.id)}
            >
              {/* Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[24px]">content_copy</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template.id);
                  }}
                  className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  Использовать
                </button>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              
              {template.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {template.duration_days && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span>{template.duration_days} {template.duration_days === 1 ? 'день' : 'дня'}</span>
                  </div>
                )}
                {template.components_count && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">widgets</span>
                    <span>{template.components_count} компонентов</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayTemplates.length === 0 && (
          <div className="glass-card rounded-xl py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">content_copy</span>
            <p className="text-gray-400 text-sm mb-4">Шаблоны не найдены</p>
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Создать первый шаблон
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
