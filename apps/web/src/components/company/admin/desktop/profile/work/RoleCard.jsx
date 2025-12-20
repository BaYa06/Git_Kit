export default function RoleCard({ work }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Должность</h3>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
          {work.status}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
        <div>
          <span className="block text-xs text-gray-500 mb-1.5">Роль в системе</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-dark border border-white/10 text-sm font-medium text-white">
            <span className="size-2 rounded-full bg-primary" />
            Admin
          </span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 mb-1">Должность</span>
          <span className="block text-sm font-medium text-white">{work.position}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 mb-1">Отдел / Команда</span>
          <span className="block text-sm font-medium text-white">{work.department}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 mb-1">Руководитель</span>
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-full bg-gray-600 bg-cover"
              style={{ backgroundImage: `url(${work.managerAvatar || ''})` }}
            />
            <span className="text-sm font-medium text-white">{work.manager}</span>
          </div>
        </div>
        <div>
          <span className="block text-xs text-gray-500 mb-1">Дата найма</span>
          <span className="block text-sm font-medium text-white">{work.hireDate}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500 mb-1">Стаж</span>
          <span className="block text-sm font-medium text-gray-300">{work.tenure}</span>
        </div>
      </div>
    </div>
  );
}
