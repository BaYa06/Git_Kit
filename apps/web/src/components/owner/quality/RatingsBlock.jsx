import { useMemo, useState } from 'react';

const formatScore = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(1);
};

export default function RatingsBlock({ objects }) {
  const [tab, setTab] = useState('guides'); // guides | transport | hotels | tours
  const data = objects || {};
  const current = data[tab] || [];

  const top = useMemo(
    () => current.filter((o) => Number(o.rating) >= 4.5).sort((a, b) => b.rating - a.rating),
    [current]
  );
  const attention = useMemo(
    () => current.filter((o) => Number(o.rating) > 0 && Number(o.rating) < 4.0).sort((a, b) => a.rating - b.rating),
    [current]
  );

  const tabs = [
    { id: 'guides', label: 'Гиды' },
    { id: 'transport', label: 'Транспорт' },
    { id: 'hotels', label: 'Отели' },
    { id: 'tours', label: 'Туры' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] overflow-hidden">
      <div className="border-b border-[#f0f0f4] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-[#111118] text-lg font-bold">Рейтинги объектов</h3>
        <div className="flex p-1 bg-[#f0f0f4] rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t.id ? 'bg-white text-primary font-bold shadow-sm' : 'text-[#616189] hover:text-[#111118]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#f0f0f4]">
        <div className="p-0">
          <div className="px-6 py-3 bg-[#fafafa] border-b border-[#f0f0f4] flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: 20 }}>thumb_up</span>
            <span className="text-sm font-bold text-[#111118]">Топ (Лучшие)</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-[#f0f0f4]">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189]">Имя</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Оценка</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Отзывов</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Жалоб</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f4]">
              {top.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-xs text-[#616189]">Нет лучших</td>
                </tr>
              ) : top.map((row) => (
                <tr key={row.id} className="hover:bg-[#f8f8fa]">
                  <td className="px-6 py-3 text-sm font-medium text-[#111118]">{row.name || '—'}</td>
                  <td className="px-6 py-3 text-sm font-bold text-emerald-600 text-right">{formatScore(row.rating)}</td>
                  <td className="px-6 py-3 text-sm text-[#616189] text-right">{row.reviews || 0}</td>
                  <td className="px-6 py-3 text-sm text-[#616189] text-right">{row.negatives || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-0">
          <div className="px-6 py-3 bg-[#fafafa] border-b border-[#f0f0f4] flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500" style={{ fontSize: 20 }}>priority_high</span>
            <span className="text-sm font-bold text-[#111118]">Требуют внимания</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-[#f0f0f4]">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189]">Имя</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Оценка</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Негатив</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#616189] text-right">Отзывы</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f4]">
              {attention.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-xs text-[#616189]">Нет рисков</td>
                </tr>
              ) : attention.map((row) => (
                <tr key={row.id} className="hover:bg-[#f8f8fa] bg-rose-50/30">
                  <td className="px-6 py-3 text-sm font-medium text-[#111118]">{row.name || '—'}</td>
                  <td className="px-6 py-3 text-sm font-bold text-rose-600 text-right">{formatScore(row.rating)}</td>
                  <td className="px-6 py-3 text-sm font-medium text-rose-600 text-right">{row.negatives || 0}</td>
                  <td className="px-6 py-3 text-sm text-[#616189] text-right">{row.reviews || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
