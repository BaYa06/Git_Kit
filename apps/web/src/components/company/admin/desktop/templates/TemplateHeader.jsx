export default function TemplateHeader({ onCreate, onExport }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Шаблоны</h1>
        <p className="text-gray-400 text-sm max-w-lg">
          Создавай и редактируй шаблоны туров, чтобы быстро собирать туры.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-surface-dark/50 text-white text-sm font-medium hover:bg-surface-dark transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
          Экспорт
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Создать шаблон
        </button>
      </div>
    </div>
  );
}
