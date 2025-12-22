import { useState } from 'react';
import TimingPreview from './TimingPreview';

const badgeToneClasses = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  neutral: 'bg-surface-dark border border-white/10 text-gray-300',
};

const dotToneClasses = {
  done: 'bg-primary border-2 border-[#1F2937]',
  progress: 'bg-gray-500 border-2 border-[#1F2937]',
  idle: 'bg-gray-700 border-2 border-[#1F2937]',
};

export default function TemplateDetails({ template, loading, error, onClose, onOpenEditor }) {
  const [activeTab, setActiveTab] = useState('segments'); // 'segments' | 'timing'
  
  if (loading) {
    return (
      <div className="xl:col-span-4">
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-gray-400">
          Загружаем шаблон...
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="xl:col-span-4">
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="xl:col-span-4">
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-gray-400">
          Выберите шаблон слева, чтобы увидеть детали
        </div>
      </div>
    );
  }

  const readyPercent = Math.round((template?.checklist?.ready ?? 0) * 100);
  
  // Вычисляем длительность из timing
  const durationDays = template.timing?.length || template.durationDays || 0;
  
  const timeline =
    template.itinerary ||
    template.components?.map((comp, index) => ({
      label: comp.comment || `Сегмент ${index + 1}`,
      description: comp.type || 'Элемент',
      state: 'idle',
    })) ||
    [];

  const badges =
    template.tags && template.tags.length > 0
      ? template.tags
      : [
          durationDays > 0
            ? { 
                label: `${durationDays} ${durationDays === 1 ? 'день' : durationDays < 5 ? 'дня' : 'дней'}`, 
                tone: 'blue' 
              }
            : null,
          template.status
            ? {
                label: template.status === 'draft' ? 'Черновик' : 'Активный',
                tone: template.status === 'active' ? 'emerald' : 'neutral',
              }
            : null,
          template.segments !== undefined
            ? { label: `${template.segments} сегментов`, tone: 'neutral' }
            : null,
        ].filter(Boolean);

  return (
    <div className="xl:col-span-4">
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-6 sticky top-6 max-h-[calc(100vh-48px)] overflow-hidden">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs px-3 py-2">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white leading-tight">{template.name}</h2>
              <span className="text-xs text-gray-500">ID: {template.id}</span>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              type="button"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((tag) => (
              <span
                key={tag.label}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${badgeToneClasses[tag.tone] || badgeToneClasses.neutral}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
              Checklist
            </h3>
            <span className="text-xs font-medium text-primary">{readyPercent}% Ready</span>
          </div>
          <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${readyPercent}%` }} />
          </div>
          <div className="flex gap-2 mt-1 flex-wrap">
            {template.checklist?.items?.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium border ${
                  item.state === 'done'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : item.state === 'progress'
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {item.state === 'done' ? 'check' : item.state === 'progress' ? 'schedule' : 'more_horiz'}
                </span>
                {item.label}
              </span>
            ))}
            {!template.checklist?.items?.length && (
              <span className="text-[11px] text-gray-500">Чек-лист не заполнен</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 flex-shrink-0">
            <button
              type="button"
              className={`pb-3 px-1 text-xs font-semibold transition-colors relative ${
                activeTab === 'segments'
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('segments')}
            >
              Сегменты
              {activeTab === 'segments' && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-t-full"></span>
              )}
            </button>
            <button
              type="button"
              className={`pb-3 px-1 text-xs font-semibold transition-colors relative ${
                activeTab === 'timing'
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('timing')}
            >
              Тайминг
              {activeTab === 'timing' && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-t-full"></span>
              )}
            </button>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'segments' && (
              <>
                <h3 className="text-sm font-bold text-white mb-3">Структура тура</h3>
                <div className="relative pl-2 flex flex-col gap-0">
                  {timeline.length === 0 && (
                    <div className="text-[11px] text-gray-500 pl-2 pb-2">Нет компонентов шаблона</div>
                  )}
                  {timeline.map((step) => (
                    <div
                      key={step.label}
                      className="relative pl-6 pb-6 border-l border-gray-700 last:border-0 last:pb-0"
                    >
                      <div className={`absolute -left-[5px] top-0 size-2.5 rounded-full ${dotToneClasses[step.state] || dotToneClasses.idle}`}></div>
                      <div className="flex flex-col gap-1 -mt-1.5">
                        <span className={`text-xs font-bold ${step.state === 'done' ? 'text-white' : 'text-gray-300'}`}>
                          {step.label}
                        </span>
                        <span className="text-[11px] text-gray-500">{step.description}</span>
                      </div>
                    </div>
                  ))}
                  {template.extraDays ? (
                    <div className="relative pl-6 pt-2">
                      <div className={`absolute -left-[5px] top-2 size-2.5 rounded-full ${dotToneClasses.idle}`}></div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                        + ещё {template.extraDays} {template.extraDays === 1 ? 'день' : 'дней'}
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {activeTab === 'timing' && (
              <>
                <h3 className="text-sm font-bold text-white mb-3">Расписание по дням</h3>
                <TimingPreview timing={template.timing} />
              </>
            )}
          </div>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-3">
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            onClick={() => onOpenEditor?.(template.id)}
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Открыть конструктор
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-2.5 rounded-xl border border-white/10 bg-surface-dark/50 text-white text-xs font-semibold hover:bg-surface-dark transition-colors"
            >
              Создать тур
            </button>
            <button
              type="button"
              className="py-2.5 rounded-xl border border-white/10 bg-surface-dark/50 text-white text-xs font-semibold hover:bg-surface-dark transition-colors"
            >
              Дублировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
