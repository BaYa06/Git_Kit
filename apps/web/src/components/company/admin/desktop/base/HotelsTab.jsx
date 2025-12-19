import { useState, useMemo } from 'react';

const starRow = (count) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span
        key={i}
        className={`material-symbols-outlined text-[16px] ${i < count ? 'text-yellow-400' : 'text-gray-600'}`}
      >
        star
      </span>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const mealBadge = (meal, color) => {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  const cls = colorClasses[color] || colorClasses.gray;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${cls}`}>
      {meal}
    </span>
  );
};

export default function HotelsTab({ hotels }) {
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const hotelsData = useMemo(() => hotels || [], [hotels]);

  const selectedHotel = useMemo(
    () => hotelsData.find((h) => h.id === selectedHotelId) || null,
    [hotelsData, selectedHotelId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${selectedHotel ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs font-medium uppercase tracking-wider text-gray-500 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 w-[50px]">
                  <input className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                </th>
                <th className="px-6 py-4">Название отеля</th>
                <th className="px-6 py-4">Звёзды</th>
                <th className="px-6 py-4">Контакты</th>
                <th className="px-6 py-4">Питание</th>
                <th className="px-6 py-4">Локация</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {hotelsData.map((h) => (
                <tr
                  key={h.id}
                  className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    selectedHotelId === h.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => setSelectedHotelId(h.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0"
                      type="checkbox"
                      checked={selectedHotelId === h.id}
                      readOnly
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[15px]">{h.name}</span>
                      <span className="text-xs text-gray-500">ID: #{h.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{starRow(h.stars || 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="material-symbols-outlined text-[16px] text-gray-500">call</span>
                      <span className="text-xs">{h.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-purple-500/10 text-purple-400 border-purple-500/20 px-2.5 py-0.5 text-xs font-medium border">
                      {h.meal_plan || 'BB'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-300">{h.address || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">archive</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02] mt-auto">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Показывать строк:</span>
            <select className="rounded-lg border border-white/10 bg-black/20 py-1 pl-2 pr-6 text-xs text-white focus:border-primary focus:ring-0">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Показано 1–{hotelsData.length} из {hotelsData.length}</span>
            <div className="flex items-center gap-1">
              <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedHotel && (
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6 h-fit">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setSelectedHotelId(null)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
            <div
              className="size-24 rounded-2xl bg-cover bg-center mb-4 ring-1 ring-white/10 shadow-lg"
              style={{ backgroundImage: `url(${selectedHotel?.logo_url || ''})` }}
            ></div>
            <h2 className="text-xl font-bold text-white">{selectedHotel?.name}</h2>
            <span className="text-sm text-gray-500 mb-2">ID: #{selectedHotel?.id}</span>
            <div className="flex items-center gap-1 text-[16px] mb-3">{starRow(selectedHotel?.stars || 0)}</div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Контакты</label>
              <a
                className="text-lg font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                href={`tel:${selectedHotel?.phone}`}
              >
                {selectedHotel?.phone}
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Питание</label>
              <span className="text-sm text-white">{selectedHotel?.meal_plan || 'BB'}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Адрес</label>
              <p className="text-sm text-gray-300 leading-relaxed">{selectedHotel?.address || 'Адрес не указан'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Время заезда</label>
              <p className="text-sm text-gray-300">{selectedHotel?.checkin_from || '14:00'}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Время выезда</label>
              <p className="text-sm text-gray-300">{selectedHotel?.checkout_until || '12:00'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
