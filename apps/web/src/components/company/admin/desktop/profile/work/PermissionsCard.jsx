const toneMap = {
  emerald: 'bg-emerald-500/10 text-gray-300 border border-emerald-500/20',
  primary: 'bg-primary/10 text-gray-300 border border-primary/20',
  warning: 'bg-yellow-500/10 text-gray-300 border border-yellow-500/20',
  purple: 'bg-purple-500/10 text-gray-300 border border-purple-500/20',
  gray: 'bg-white/5 text-gray-300 border border-white/10',
};

export default function PermissionsCard({ work }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white">Доступы и права</h3>
        <span className="material-symbols-outlined text-gray-500 text-[20px]" title="Информация о правах">
          info
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-6">Права зависят от роли и глобальных настроек компании.</p>
      <div className="flex flex-wrap gap-2">
        {work.permissions?.map((perm) => (
          <span
            key={perm.label}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs ${toneMap[perm.tone] || toneMap.gray}`}
          >
            <span className="size-1.5 rounded-full bg-emerald-500 mr-2" />
            {perm.label} <span className="ml-1 opacity-60">{perm.scope}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
