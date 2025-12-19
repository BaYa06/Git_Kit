import { useRouter } from 'next/router';

export default function DesktopHeader({ company, user }) {
  const router = useRouter();

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#111621]/90 backdrop-blur-md px-6 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-[18px]">route</span>
            </div>
            <span className="text-base font-bold text-white">Git-Kit</span>
          </div>
          
          <span className="text-gray-500">/</span>
          
          <h1 className="text-base font-bold text-white leading-tight tracking-tight">
            {company?.name || 'Компания'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
          Admin
        </span>
        
        <button className="relative text-gray-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border border-[#111621]"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.name || 'Пользователь'}</p>
            <p className="text-xs text-gray-400 mt-1">Администратор</p>
          </div>
          <div 
            className="size-9 rounded-full bg-cover bg-center bg-gray-600 border border-white/10"
            style={user?.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}
          >
            {!user?.avatar && (
              <div className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
