export default function HelpHeader({ onCreateTicket }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Поддержка</h1>
        <p className="text-gray-400 text-sm">
          Найди ответ в базе знаний или создай обращение в поддержку.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span className="size-2 rounded-full bg-emerald-500" />
          Проверить статус системы
        </button>
        <button
          type="button"
          onClick={onCreateTicket}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Создать обращение
        </button>
      </div>
    </div>
  );
}
