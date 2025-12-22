function TemplateRow({ template, selected, onSelect }) {
  // Используем уже вычисленные значения из mapTemplateFromApi
  const durationDays = template.durationDays || 0;
  const durationNights = template.nights ?? (durationDays > 0 ? durationDays - 1 : 0);
  
  // Находим первое событие типа "встреча" в timing
  const firstMeeting = template.timing?.flatMap(day => day.items || [])
    .find(item => item.type === 'meeting');
  
  const meetingLocation = firstMeeting?.title || template.location || '—';
  
  const getDaysLabel = (days) => {
    if (days === 1) return 'день';
    if (days < 5) return 'дня';
    return 'дней';
  };
  
  const getNightsLabel = (nights) => {
    if (nights === 1) return 'ночь';
    if (nights < 5) return 'ночи';
    return 'ночей';
  };
  
  const durationLabel = durationDays > 0
    ? `${durationDays} ${getDaysLabel(durationDays)} / ${durationNights} ${getNightsLabel(durationNights)}`
    : '—';

  return (
    <div
      className={`group grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/10 cursor-pointer transition-colors relative ${
        selected
          ? 'bg-white/[0.04] border-l-[3px] border-l-primary'
          : 'hover:bg-white/[0.02]'
      }`}
      onClick={() => onSelect?.(template.id)}
    >
      <div className="col-span-5 flex flex-col gap-0.5">
        <span className={`text-sm font-bold ${
          selected ? 'text-white' : 'text-gray-200 group-hover:text-white'
        } transition-colors`}>
          {template.name}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {meetingLocation}
        </span>
      </div>
      <div className="col-span-2">
        <span className="text-sm text-gray-300">{durationLabel}</span>
      </div>
      <div className="col-span-2 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-surface-dark border border-white/10 text-xs text-gray-300">
          {template.segments ?? '—'}
        </span>
      </div>
      <div className="col-span-2">
        <span className="text-sm text-gray-400">{template.updatedLabel || '—'}</span>
      </div>
      <div className="col-span-1 flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button className="text-gray-400 hover:text-white" type="button">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button className="text-gray-400 hover:text-white" type="button">
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
        </button>
        <button className="text-gray-400 hover:text-red-400" type="button">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

export default function TemplatesList({ templates, selectedId, onSelect, loading, error }) {
  return (
    <div className="xl:col-span-8 flex flex-col gap-4">
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 bg-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Название</div>
          <div className="col-span-2">Длительность</div>
          <div className="col-span-2 text-center">Сегменты</div>
          <div className="col-span-2">Обновлено</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {loading && templates.length === 0 && (
          <div className="flex-1 grid place-items-center py-14 text-center text-sm text-gray-400">
            Загружаем шаблоны...
          </div>
        )}

        {error && templates.length === 0 && !loading && (
          <div className="flex-1 grid place-items-center py-14 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          templates.map((template) => (
            <TemplateRow
              key={template.id}
              template={template}
              selected={template.id === selectedId}
              onSelect={onSelect}
            />
          ))}

        {!loading && !error && templates.length === 0 && (
          <div className="flex-1 grid place-items-center py-14 text-center text-sm text-gray-400">
            Шаблоны не найдены
          </div>
        )}

        <div className="mt-auto border-t border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Показать строк:</span>
            <select className="bg-surface-dark border border-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition" type="button">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-xs font-medium text-white px-2">1 из 4</span>
            <button className="size-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition" type="button">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
