export default function SecurityCard({ data }) {
  return (
    <div className="glass-card rounded-[20px] p-6 mb-8">
      <h3 className="text-lg font-bold text-white mb-6">Безопасность</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="block text-sm font-medium text-white">Пароль</span>
              <span className="text-sm text-gray-500">{data.passwordMask}</span>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition">
              Изменить
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div>
              <span className="block text-sm font-medium text-white">Двухфакторная аутентификация</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {data.twofaEnabled ? 'Включено' : 'Выключено'}
              </span>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none">
              <span className="inline-block size-4 transform rounded-full bg-white transition translate-x-6"></span>
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Активные сессии</span>
          <div className="space-y-4">
            {data.sessions?.map((session) => (
              <div className="flex items-center justify-between" key={session.device}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">{session.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{session.device}</span>
                    <span className="text-xs text-gray-500">{session.location}</span>
                  </div>
                </div>
                {session.current ? (
                  <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">Current</span>
                ) : (
                  <button className="text-xs text-gray-500 hover:text-white transition">Выйти</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
