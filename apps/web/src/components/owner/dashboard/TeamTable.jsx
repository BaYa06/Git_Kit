const teamData = [
  {
    id: 1,
    name: 'Елена А.',
    initials: 'EA',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    sales: '1.2M',
    plan: 102,
    planColor: 'text-emerald-600',
    barColor: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Дмитрий К.',
    initials: 'ДК',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    sales: '980K',
    plan: 85,
    planColor: 'text-[#1313ec]',
    barColor: 'bg-[#1313ec]',
  },
  {
    id: 3,
    name: 'Анна С.',
    initials: 'АС',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    sales: '450K',
    plan: 45,
    planColor: 'text-amber-600',
    barColor: 'bg-amber-500',
  },
];

export default function TeamTable({ data = teamData, onViewDetails }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0f0f4] flex items-center justify-between">
        <h3 className="text-[#111118] text-lg font-bold">Эффективность команды</h3>
        <button 
          onClick={onViewDetails}
          className="text-[#1313ec] text-sm font-semibold hover:underline"
        >
          Подробнее
        </button>
      </div>
      
      <div className="p-0">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
            <tr>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189]">Менеджер</th>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189] text-right">Продажи</th>
              <th className="px-6 py-2 text-xs font-semibold text-[#616189] text-right">План</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4]">
            {data.map((member) => (
              <tr key={member.id} className="hover:bg-[#f8f8fa]">
                <td className="px-6 py-3 flex items-center gap-3">
                  <div className={`size-8 rounded-full ${member.bgColor} ${member.textColor} flex items-center justify-center text-xs font-bold`}>
                    {member.initials}
                  </div>
                  <span className="text-sm font-medium text-[#111118]">{member.name}</span>
                </td>
                <td className="px-6 py-3 text-right text-sm text-[#111118] font-bold">
                  {member.sales}
                </td>
                <td className="px-6 py-3 w-32">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-xs font-medium ${member.planColor}`}>{member.plan}%</span>
                    <div className="w-16 h-1.5 bg-[#f0f0f4] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${member.barColor}`}
                        style={{ width: `${Math.min(member.plan, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
