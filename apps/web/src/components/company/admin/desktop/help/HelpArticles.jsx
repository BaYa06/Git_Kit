function ArticleRow({ icon, title, subtitle }) {
  return (
    <a className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-xl transition-colors group border-b border-white/10 last:border-0" href="#">
      <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors">{icon}</span>
      <div className="flex flex-col flex-1 gap-0.5">
        <span className="text-sm font-medium text-gray-200 group-hover:text-white">{title}</span>
        {subtitle ? <span className="text-xs text-gray-500">{subtitle}</span> : null}
      </div>
      <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span>
    </a>
  );
}

export default function HelpArticles({ popular, recent }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white px-1">Популярные статьи</h3>
        <div className="glass-card rounded-2xl p-1">
          {popular.map((item) => (
            <ArticleRow key={item.id} icon="article" title={item.title} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white px-1">Недавно обновлено</h3>
        <div className="glass-card rounded-2xl p-1">
          {recent.map((item) => (
            <ArticleRow key={item.id} icon="update" title={item.title} subtitle={item.time} />
          ))}
        </div>
      </div>
    </div>
  );
}
