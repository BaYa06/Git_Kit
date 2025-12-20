export default function ProfileCard({ data }) {
  return (
    <div className="glass-card rounded-[20px] p-5">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div
            className="size-16 rounded-xl bg-cover bg-center shadow-lg ring-2 ring-white/5 shrink-0"
            style={{ backgroundImage: `url(${data.avatar || ''})` }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{data.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                {data.role}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">business</span>
                {data.company}
              </span>
              <span className="size-1 bg-gray-600 rounded-full" />
              <span className="font-mono text-gray-500">{data.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/10 mb-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Конфиденциально
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">visibility_off</span>
              Доступ ограничен
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
