import { useState, useMemo } from 'react';

export default function TransportTab({ drivers }) {
  const [selectedTransportId, setSelectedTransportId] = useState(null);

  const transportData = useMemo(() => {
    if (drivers && drivers.length) {
      return drivers.map((d) => ({
        id: d.id,
        name: d.car_name || 'Без названия',
        type: 'Транспорт',
        typeColor: 'blue',
        plate: d.plate_number || '',
        seats: d.seats || '-',
        driverName: d.full_name || '',
        driverAvatar: null,
        driverPhone: d.phone || '',
        phoneShort: (d.phone || '').slice(0, 7),
        status: 'Active',
        note: d.notes || '',
      }));
    }
    return [];
  }, [drivers]);

  const selectedTransport = useMemo(
    () => transportData.find((t) => t.id === selectedTransportId) || null,
    [transportData, selectedTransportId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={`${selectedTransport ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs font-medium uppercase tracking-wider text-gray-500 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 w-[50px]">
                  <input className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                </th>
                <th className="px-6 py-4">Транспорт</th>
                <th className="px-6 py-4">Гос. номер</th>
                <th className="px-6 py-4">Водитель</th>
                <th className="px-6 py-4">Контакты</th>
                <th className="px-6 py-4">Места</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transportData.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                    selectedTransportId === t.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => setSelectedTransportId(t.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0"
                      type="checkbox"
                      checked={selectedTransportId === t.id}
                      readOnly
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[15px]">{t.name}</span>
                      <span className="text-xs text-gray-500">ID: #{t.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-mono font-medium text-white border border-white/10">
                      {t.plate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-white/10">
                        <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                      </div>
                      <span className="text-sm text-white">{t.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-gray-500">call</span>
                      <span className="text-xs text-white">{t.driverPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-white">
                      <span className="material-symbols-outlined text-[16px] text-gray-500">airline_seat_recline_normal</span>
                      {t.seats}
                    </span>
                  </td>
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
            <span className="text-xs text-gray-400">Показано 1–{transportData.length} из {transportData.length}</span>
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
      {selectedTransport && (
        <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6 h-fit">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setSelectedTransportId(null)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
            <div className="size-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-4 ring-1 ring-white/10 shadow-lg">
              <span className="material-symbols-outlined text-[48px] text-blue-400">directions_car</span>
            </div>
            <h2 className="text-xl font-bold text-white">{selectedTransport?.name}</h2>
            <span className="text-sm text-gray-500 mb-2">ID: #{selectedTransport?.id}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              Доступен
            </span>
          </div>

          <div className="py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Гос. номер</label>
              <div className="rounded-xl bg-surface-dark/30 p-3 border border-white/10">
                <span className="text-lg font-mono font-bold text-white">{selectedTransport?.plate}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Водитель</label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-dark/30 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-white/10">
                    <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{selectedTransport?.driverName}</span>
                    <span className="text-xs text-gray-500">{selectedTransport?.driverPhone}</span>
                  </div>
                </div>
                <button className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Вместимость</label>
              <div className="rounded-xl bg-surface-dark/30 p-3 border border-white/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">airline_seat_recline_normal</span>
                <span className="text-sm text-white">
                  <span className="font-bold text-lg text-primary">{selectedTransport?.seats}</span> мест
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заметки</label>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-h-[80px]">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedTransport?.note || 'Нет заметок'}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                Редактировать
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface-dark/50 border border-white/10 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                График
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all">
              <span className="material-symbols-outlined text-[18px]">archive</span>
              Архивировать транспорт
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
