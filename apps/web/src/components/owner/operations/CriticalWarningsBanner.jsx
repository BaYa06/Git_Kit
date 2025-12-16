export default function CriticalWarningsBanner({ warnings = [], onOpenList }) {
  const defaultWarnings = [
    { type: 'no_guide', label: 'Нет гида', count: 2 },
    { type: 'transport', label: 'Транспорт не подтвержден', count: 1 },
    { type: 'documents', label: 'Документы', count: 2 },
  ];

  const warningsList = warnings.length > 0 ? warnings : defaultWarnings;
  const totalCount = warningsList.reduce((sum, w) => sum + w.count, 0);
  const tourIds = ['#4021', '#4025'];

  if (totalCount === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-rose-100 p-2 rounded-lg text-rose-600 flex-shrink-0">
          <span className="material-symbols-outlined">notification_important</span>
        </div>
        <div>
          <h3 className="text-slate-900 text-sm font-bold">{totalCount} критических предупреждений</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {warningsList.map((warning, index) => (
              <span key={warning.type} className="flex items-center gap-2">
                <span className="text-rose-700 text-xs font-medium">
                  {warning.label} ({warning.count})
                </span>
                {index < warningsList.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-rose-300"></span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 self-end md:self-auto">
        <div className="flex -space-x-2">
          {tourIds.map((id) => (
            <div
              key={id}
              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600"
              title={`Тур ${id}`}
            >
              {id}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-rose-100 text-[10px] flex items-center justify-center font-bold text-rose-600 z-10">
            +{Math.max(0, totalCount - tourIds.length)}
          </div>
        </div>
        <button
          onClick={onOpenList}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-white border border-rose-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          Открыть список
        </button>
      </div>
    </div>
  );
}
