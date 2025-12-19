import { useMemo, useState } from 'react';

const statusBadge = (status) => {
  if (status === 'Active')
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-400">
      Archived
    </span>
  );
};

export default function GuidesTab({ guides }) {
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name');
  const [languageFilter, setLanguageFilter] = useState('all');

  const guidesData = useMemo(() => {
    if (guides && guides.length) {
      return guides.map((g) => ({
        id: g.id,
        name: g.full_name || 'Без имени',
        avatar: g.logo_url || null,
        phone: g.phone || '',
        email: g.email || '',
        languages: Array.isArray(g.languages) ? g.languages.map((l) => (l || '').toLowerCase()) : [],
        status: g.is_active === false ? 'Archived' : 'Active',
        rating: Number(g.avg_rating || 0),
        reviews: Number(g.reviews_count || 0),
        notes: g.notes || '',
      }));
    }
    return [];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    let list = guidesData;
    if (statusFilter === 'active') list = list.filter((g) => g.status === 'Active');
    if (statusFilter === 'archived') list = list.filter((g) => g.status !== 'Active');
    if (languageFilter !== 'all') {
      list = list.filter((g) =>
        (g.languages || []).some((lng) => (lng || '').toLowerCase().startsWith(languageFilter))
      );
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((g) =>
        [g.name, g.phone, g.email].some((field) => (field || '').toLowerCase().includes(q))
      );
    }
    if (sortOption === 'name') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'rating') {
      list = [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    return list;
  }, [guidesData, statusFilter, languageFilter, searchTerm, sortOption]);

  const selectedGuide = useMemo(
    () => filteredGuides.find((g) => g.id === selectedGuideId) || null,
    [filteredGuides, selectedGuideId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${selectedGuide ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col`}>
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
              search
            </span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="Поиск по имени, телефону или email..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="all">Все языки</option>
              <option value="ru">Русский</option>
              <option value="en">Английский</option>
              <option value="de">Немецкий</option>
              <option value="es">Испанский</option>
            </select>

            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="name">По имени</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>
        </div>

        {/* Grid of cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`group relative overflow-hidden rounded-xl border bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-primary/50 ${
                selectedGuideId === guide.id ? 'border-primary ring-2 ring-primary/20' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="size-12 rounded-full bg-cover bg-center ring-2 ring-white/10 shrink-0"
                  style={{ backgroundImage: `url(${guide?.avatar || ''})` }}
                ></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                    {guide.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{guide.phone}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {statusBadge(guide.status)}
                    <span className="inline-flex items-center gap-0.5 text-xs text-gray-300">
                      <span className="material-symbols-outlined text-[12px] text-yellow-400">star</span>
                      {guide?.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {guide.languages?.slice(0, 3).map((lang) => (
                  <span
                    key={lang}
                    className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-gray-300 border border-white/10"
                  >
                    {(lang || '').toUpperCase()}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedGuide && (
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setSelectedGuideId(null)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
            <div
              className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-white/5"
              style={{ backgroundImage: `url(${selectedGuide?.avatar || ''})` }}
            ></div>
            <h2 className="text-xl font-bold text-white">{selectedGuide?.name}</h2>
            <span className="text-sm text-gray-500 mb-2">ID: #{selectedGuide?.id}</span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                {selectedGuide?.status === 'Active' ? 'Active' : 'Archived'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-gray-200 border border-white/10">
                <span className="material-symbols-outlined text-[14px]">star</span>
                {selectedGuide?.rating?.toFixed(1) || '0.0'}
                <span className="text-[10px] text-gray-400">({selectedGuide?.reviews || 0})</span>
              </span>
            </div>
          </div>

          <div className="py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Контакты</label>
              <a className="text-lg font-medium text-primary hover:underline hover:text-primary/80 transition-colors" href={`tel:${selectedGuide?.phone}`}>
                {selectedGuide?.phone}
              </a>
              {selectedGuide?.email && (
                <a className="text-sm text-gray-300 hover:text-primary transition-colors" href={`mailto:${selectedGuide?.email}`}>
                  {selectedGuide?.email}
                </a>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Языки</label>
              <div className="flex flex-wrap gap-2">
                {selectedGuide?.languages?.map((lang) => (
                  <span key={lang} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-200 border border-white/10">
                    {(lang || '').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заметки</label>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-h-[80px]">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedGuide?.notes || 'Нет заметок'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
