import { useEffect, useMemo, useState } from 'react';

const formatNumber = (value) => {
  try {
    return new Intl.NumberFormat('ru-RU').format(value);
  } catch {
    return String(value);
  }
};

export default function TeamManagersContent({
  companyId,
  period = '30days',
  search = '',
  isCreateManagerOpen,
  onCloseCreateManager,
}) {
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7days':
        return 'за 7 дней';
      case '30days':
        return 'за 30 дней';
      case 'quarter':
        return 'за 90 дней';
      case 'custom':
        return 'за период';
      default:
        return 'за 30 дней';
    }
  }, [period]);

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;

      setLoading(true);
      setLoadError(null);

      try {
        const url = new URL('/api/v1/owner/team-managers', window.location.origin);
        url.searchParams.set('companyId', companyId);
        url.searchParams.set('period', period);
        if (search) url.searchParams.set('search', search);

        const res = await fetch(url.toString());
        if (!res.ok) {
          let data = {};
          try {
            data = await res.json();
          } catch {}
          throw new Error(data?.error || `Ошибка ${res.status}`);
        }

        const data = await res.json();
        const rows = Array.isArray(data.managers) ? data.managers : [];

        setManagers(
          rows.map((row) => {
            const name =
              [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email || '—';
            const initialsSource = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
            const initials =
              initialsSource
                ? initialsSource
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()
                : String(row.email || '—').slice(0, 2).toUpperCase();

            const salesPeople = Number(row.salesPeople || 0);
            const revenue = Number(row.revenue || 0);
            const avgCheck = salesPeople > 0 ? revenue / salesPeople : null;

            return {
              id: row.id,
              initials,
              initialsColor: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
              name,
              email: row.email || '—',
              phone: row.phone || null,
              status: 'Активен',
              statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              role: 'Менеджер',
              leads: 0,
              sales: salesPeople,
              conversion: '0%',
              conversionColor: 'text-[#616189]',
              avgCheck,
              sla: '—',
              slaColor: 'text-[#616189]',
              lastActive: '—',
            };
          })
        );
        setStats(data.stats || null);
      } catch (e) {
        setManagers([]);
        setStats(null);
        setLoadError(e.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyId, period, search, reloadKey]);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedCount = selectedIds.size;

  const allSelected = managers.length > 0 && managers.every((m) => selectedIds.has(m.id));

  const setSelected = (next) => setSelectedIds(new Set(next));

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
      return;
    }
    setSelected(managers.map((m) => m.id));
  };

  const clearSelection = () => setSelected([]);

  const removeManager = async (userId, { shouldReload = true } = {}) => {
    if (!companyId) return;
    try {
      const res = await fetch('/api/v1/owner/team-managers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, userId }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.error || `Ошибка ${res.status}`);
      }

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setManagers((prev) => prev.filter((m) => m.id !== userId));
      setStats((prev) => {
        if (!prev) return prev;
        const nextCount = Math.max(0, Number(prev.managersCount || 0) - 1);
        return { ...prev, managersCount: nextCount };
      });
      if (shouldReload) setReloadKey((v) => v + 1);
    } catch (e) {
      window.alert(e.message || 'Не удалось удалить');
    }
  };

  const deleteSelected = async () => {
    if (selectedCount === 0) return;
    const ok = window.confirm(`Удалить выбранных менеджеров: ${selectedCount}?`);
    if (!ok) return;

    const ids = Array.from(selectedIds);
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await removeManager(id, { shouldReload: false });
    }
    clearSelection();
    setReloadKey((v) => v + 1);
  };

  const deleteManager = async (userId) => {
    const ok = window.confirm('Удалить менеджера из компании?');
    if (!ok) return;
    await removeManager(userId);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e0e0e4] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start">
            <span className="text-[#616189] text-xs font-bold uppercase tracking-wide">
              Активные менеджеры
            </span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                groups
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#111118]">
              {formatNumber(Number(stats?.managersCount || 0))}
            </div>
            <div className="text-xs text-[#9ca3af] mt-1">Всего активных в компании</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e0e0e4] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start">
            <span className="text-[#616189] text-xs font-bold uppercase tracking-wide">
              Лиды
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                filter_alt
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#111118]">
              {formatNumber(0)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-[#9ca3af]">{periodLabel}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e0e0e4] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start">
            <span className="text-[#616189] text-xs font-bold uppercase tracking-wide">
              Продажи
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                shopping_cart
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#111118]">
              {formatNumber(Number(stats?.sales?.people || 0))}
            </div>
            <div className="text-xs text-[#9ca3af] mt-1">{periodLabel}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e0e0e4] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:border-primary/30 transition-colors group">
          <div className="flex justify-between items-start">
            <span className="text-[#616189] text-xs font-bold uppercase tracking-wide">
              Конверсия
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                percent
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#111118]">0%</div>
            <div className="text-xs text-[#9ca3af] mt-1">{periodLabel}</div>
          </div>
        </div>
      </div>

      {isCreateManagerOpen ? (
        <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0f0f4] bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111118]">
              Добавить нового менеджера
            </h3>
            <button
              type="button"
              onClick={onCloseCreateManager}
              className="text-[#616189] hover:text-[#111118] transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                close
              </span>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#616189] mb-1.5">
                    Имя
                  </label>
                  <input
                    className="w-full h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Введите имя"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#616189] mb-1.5">
                    Фамилия
                  </label>
                  <input
                    className="w-full h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Введите фамилию"
                    type="text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#616189] mb-1.5">
                  Email (логин)
                </label>
                <input
                  className="w-full h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="example@company.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#616189] mb-1.5">
                    Телефон
                  </label>
                  <input
                    className="w-full h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="+996 ..."
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#616189] mb-1.5">
                    Роль
                  </label>
                  <select className="w-full h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option>Менеджер</option>
                    <option>Старший менеджер</option>
                    <option>Стажёр</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#616189] mb-2">
                  Способ доступа
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      defaultChecked
                      className="text-primary focus:ring-primary"
                      name="access"
                      type="radio"
                    />
                    <span className="text-sm text-[#111118]">
                      Отправить приглашение на Email
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="text-primary focus:ring-primary"
                      name="access"
                      type="radio"
                    />
                    <span className="text-sm text-[#111118]">
                      Задать пароль вручную
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#f0f0f4] bg-[#fcfcfd] flex items-center justify-end gap-3">
            <span className="text-xs text-[#616189] mr-auto">
              Сотрудник получит доступ к CRM согласно выбранной роли.
            </span>
            <button
              type="button"
              onClick={onCloseCreateManager}
              className="px-4 py-2 bg-white border border-[#e0e0e4] text-[#111118] text-sm font-medium rounded-lg hover:bg-[#f8f8fa] transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark shadow-sm transition-colors"
            >
              Создать сотрудника
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f4] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {selectedCount > 0 ? (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                <span className="text-sm font-bold text-primary">
                  Выбрано: {selectedCount}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-2 text-[#616189] hover:text-[#111118] transition-colors"
                  aria-label="Снять выделение"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    close
                  </span>
                </button>
              </div>
            ) : null}

            <div className="h-6 w-px bg-[#e0e0e4]"></div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={deleteSelected}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-[#e0e0e4] rounded hover:bg-rose-50 hover:border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Удалить
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none h-9 pl-3 pr-8 bg-white border border-[#e0e0e4] rounded-lg text-xs font-medium text-[#111118] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                <option>Статус: Все</option>
                <option>Активен</option>
                <option>Неактивен</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#616189]">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  expand_more
                </span>
              </span>
            </div>

            <div className="relative">
              <select className="appearance-none h-9 pl-3 pr-8 bg-white border border-[#e0e0e4] rounded-lg text-xs font-medium text-[#111118] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                <option>Роль: Все</option>
                <option>Старший менеджер</option>
                <option>Менеджер</option>
                <option>Стажёр</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#616189]">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  expand_more
                </span>
              </span>
            </div>

            <button
              type="button"
              className="p-1.5 text-[#616189] hover:bg-[#f0f0f4] rounded transition-colors"
              title="Настройки"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                settings
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    aria-label="Выбрать всех"
                  />
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                  Менеджер
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-center">
                  Статус
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                  Роль
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Лиды
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Продажи
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Конв., %
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Ср. чек
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  SLA
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Активность
                </th>
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0f0f4] text-sm">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-[#616189]" colSpan={11}>
                    Загрузка менеджеров…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-rose-600" colSpan={11}>
                    {loadError}
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-[#616189]" colSpan={11}>
                    Менеджеры не найдены
                  </td>
                </tr>
              ) : managers.map((manager) => {
                const isSelected = selectedIds.has(manager.id);

                return (
                  <tr
                    key={manager.id}
                    className={[
                      'group hover:bg-[#f8f8fa] transition-colors',
                      manager.rowStyle || '',
                      isSelected ? 'ring-1 ring-primary/10' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(manager.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        aria-label={`Выбрать ${manager.name}`}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-9 rounded-full ${manager.initialsColor} flex items-center justify-center font-bold text-xs`}
                        >
                          {manager.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111118]">
                            {manager.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#616189]">
                            <span>{manager.email}</span>
                            {manager.phone ? (
                              <>
                                <span className="size-1 bg-[#d1d1d6] rounded-full"></span>
                                <span>{manager.phone}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${manager.statusColor}`}
                      >
                        {manager.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#111118]">{manager.role}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#616189]">
                      {formatNumber(manager.leads)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-[#111118]">
                      {formatNumber(manager.sales)}
                    </td>
                    <td
                      className={`px-6 py-4 text-right tabular-nums font-medium ${manager.conversionColor}`}
                    >
                      {manager.conversion}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#111118]">
                      {manager.avgCheck ? formatNumber(manager.avgCheck) : '—'}
                    </td>
                    <td
                      className={`px-6 py-4 text-right tabular-nums ${manager.slaColor}`}
                    >
                      {manager.sla}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-[#616189]">
                      —
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => deleteManager(manager.id)}
                        className="font-medium text-xs px-2 py-1 text-[#616189] hover:text-rose-600 transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-[#f0f0f4] bg-[#fcfcfd] flex items-center justify-between text-xs text-[#616189]">
          <span>
            Показано {formatNumber(managers.length)} из{' '}
            {formatNumber(Number(stats?.managersCount || managers.length))} менеджеров
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4] disabled:opacity-50"
              disabled
            >
              Предыдущая
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4] disabled:opacity-50"
              disabled
            >
              Следующая
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs text-[#9ca3af] pb-8 px-2">
        <div className="flex flex-col gap-1 max-w-lg">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              info
            </span>
            <span className="font-medium text-[#616189]">
              Политика управления командой
            </span>
          </div>
          <p>
            Только Владелец и Супер-админ могут удалять менеджеров. Удаление является
            «мягким» — доступ отключается, сотрудник скрывается из списков, но
            история его продаж и лидов сохраняется для отчетности.
          </p>
        </div>
        <div className="text-right">
          <p>
            Последнее обновление данных:{' '}
            <span className="text-[#616189]">Сегодня, 17:05</span>
          </p>
        </div>
      </div>
    </>
  );
}
