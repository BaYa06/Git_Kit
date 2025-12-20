export default function WorkSummary({ data }) {
  return (
    <div className="glass-card rounded-[20px] p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 w-full lg:w-auto text-center sm:text-left">
        <div
          className="size-16 rounded-full bg-cover bg-center shrink-0 shadow-lg ring-2 ring-white/10"
          style={{ backgroundImage: `url(${data.avatar || ''})` }}
        />
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-1.5">
            <h2 className="text-xl font-bold text-white">{data.name}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
              {data.role}
            </span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-sm text-gray-400">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">call</span> {data.contacts.phone}
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">mail</span> {data.contacts.email}
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1.5 whitespace-nowrap hover:text-primary transition cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">send</span> {data.contacts.telegram}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center lg:justify-end gap-8 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8 w-full lg:w-auto">
        <div className="text-center lg:text-left">
          <span className="block text-xs text-gray-500 mb-0.5">Компания</span>
          <span className="text-sm font-medium text-white">{data.company}</span>
        </div>
        <div className="text-center lg:text-left">
          <span className="block text-xs text-gray-500 mb-0.5">User ID</span>
          <span className="text-sm font-mono text-gray-300">{data.id}</span>
        </div>
      </div>
    </div>
  );
}
