export default function SettingsHeader({ hasChanges, onReset, onSave }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-[#111118]">Настройки</h2>
        <p className="text-[#616189] mt-1 text-sm">
          Управление компанией, доступом, интеграциями и оплатой
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-[#f0f0f4]">
        {!hasChanges && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 px-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              check_circle
            </span>
            Все изменения сохранены
          </span>
        )}
        {hasChanges && (
          <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5 px-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              pending
            </span>
            Есть несохранённые изменения
          </span>
        )}

        <div className="h-6 w-px bg-[#e0e0e4]" />

        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[#616189] hover:text-[#111118] hover:bg-[#f0f0f4] transition-colors"
        >
          Сбросить
        </button>

        <button
          onClick={onSave}
          disabled={!hasChanges}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            hasChanges
              ? 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/90'
              : 'bg-primary/50 text-white cursor-not-allowed shadow-none'
          }`}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
