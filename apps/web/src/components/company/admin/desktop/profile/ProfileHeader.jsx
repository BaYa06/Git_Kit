export default function ProfileHeader({ onEdit, onExport }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Профиль</h1>
        <p className="text-gray-400 mt-1 text-sm">Личные данные, роль в компании, начисления и документы.</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm hover:bg-white/10 transition"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Редактировать
        </button>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm hover:bg-white/10 transition"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Экспорт
        </button>
      </div>
    </div>
  );
}
