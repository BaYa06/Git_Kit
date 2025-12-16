import { useState } from 'react';

export default function EfficiencyTable({ employees }) {
  const [activeTab, setActiveTab] = useState('managers');

  const tabs = [
    { id: 'managers', label: 'Менеджеры' },
    { id: 'guides', label: 'Гиды' },
    { id: 'coordinators', label: 'Координаторы' },
    { id: 'drivers', label: 'Водители' },
  ];

  const defaultEmployees = [
    {
      id: 1,
      initials: 'AK',
      initialsColor: 'bg-purple-100 text-purple-600',
      name: 'Алина К.',
      username: '@alinak_sales',
      leads: 420,
      sales: 62,
      conversion: 14.8,
      conversionColor: 'text-emerald-600',
      avgCheck: '68,000',
      sla: '12 min',
      slaColor: 'text-emerald-600',
      planProgress: 78,
      planColor: 'bg-primary',
      riskColor: 'bg-emerald-400',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 2,
      initials: 'DM',
      initialsColor: 'bg-blue-100 text-blue-600',
      name: 'Дмитрий М.',
      username: '@dimas_tour',
      leads: 380,
      sales: 45,
      conversion: 11.8,
      conversionColor: 'text-amber-600',
      avgCheck: '62,500',
      sla: '25 min',
      slaColor: 'text-[#616189]',
      planProgress: 60,
      planColor: 'bg-amber-400',
      riskColor: 'bg-amber-400',
      riskTooltip: 'Low Conversion',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 3,
      initials: 'SV',
      initialsColor: 'bg-orange-100 text-orange-600',
      name: 'Светлана В.',
      username: '@svetlana_travel',
      leads: 210,
      sales: 12,
      conversion: 5.7,
      conversionColor: 'text-rose-600',
      avgCheck: '55,000',
      sla: '45 min',
      slaColor: 'text-rose-600',
      planProgress: 25,
      planColor: 'bg-rose-500',
      riskColor: 'bg-rose-500',
      riskPulse: true,
      status: 'Probation',
      statusColor: 'bg-gray-100 text-gray-600',
    },
  ];

  const data = employees || defaultEmployees;

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#f0f0f4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-[#111118]">Топ по эффективности</h3>
        <div className="flex bg-[#f6f6f8] p-1 rounded-lg self-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary font-semibold shadow-sm'
                  : 'text-[#616189] hover:text-[#111118]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                Сотрудник
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                Лиды
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                Продажи
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                Конв.
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                Ср. Чек
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                SLA
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider w-32">
                План / Факт
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-center">
                Риск
              </th>
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                Статус
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4] text-sm">
            {data.map((employee) => (
              <tr key={employee.id} className="group hover:bg-[#f8f8fa] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-full ${employee.initialsColor} flex items-center justify-center font-bold`}
                    >
                      {employee.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111118]">{employee.name}</p>
                      <p className="text-xs text-[#616189]">{employee.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-[#616189]">{employee.leads}</td>
                <td className="px-6 py-4 text-right tabular-nums font-medium text-[#111118]">
                  {employee.sales}
                </td>
                <td className={`px-6 py-4 text-right tabular-nums font-bold ${employee.conversionColor}`}>
                  {employee.conversion}%
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-[#111118]">{employee.avgCheck}</td>
                <td className={`px-6 py-4 text-right tabular-nums ${employee.slaColor}`}>{employee.sla}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-[#616189]">
                      <span>{employee.planProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f0f0f4] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${employee.planColor} rounded-full`}
                        style={{ width: `${employee.planProgress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="group/tooltip relative inline-flex">
                    <span
                      className={`inline-block size-2 rounded-full ${employee.riskColor} ${
                        employee.riskPulse ? 'animate-pulse' : ''
                      } cursor-help`}
                    />
                    {employee.riskTooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {employee.riskTooltip}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.statusColor}`}
                  >
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-[#f0f0f4] bg-[#fcfcfd] flex items-center justify-between text-xs text-[#616189]">
        <span>Показано 3 из 12 сотрудников</span>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4] disabled:opacity-50"
            disabled
          >
            Предыдущая
          </button>
          <button className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4]">
            Следующая
          </button>
        </div>
      </div>
    </div>
  );
}
