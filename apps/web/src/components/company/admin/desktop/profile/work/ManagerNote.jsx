export default function ManagerNote({ note }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Заметки руководителя</h3>
        <button className="text-xs text-primary hover:text-white transition" type="button">
          Редактировать
        </button>
      </div>
      <div className="p-4 bg-[#111621]/50 rounded-xl border border-white/5">
        <p className="text-sm text-gray-300 leading-relaxed">{note}</p>
      </div>
    </div>
  );
}
