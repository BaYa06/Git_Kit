import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import TemplateHeader from './TemplateHeader';
import TemplateFilters from './TemplateFilters';
import TemplatesList from './TemplatesList';
import TemplateDetails from './TemplateDetails';
import TemplateEditor from '../../mobile/TemplateEditor';
import {
  SAMPLE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_DIRECTIONS,
  TEMPLATE_TYPES,
} from './templateData';

const formatUpdatedLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (diffDays === 1) {
    return 'Вчера';
  }

  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
};

const computeDuration = (start, end, fallbackDays, fallbackNights) => {
  const result = { days: fallbackDays || 0, nights: fallbackNights || 0 };
  if (!start || !end) return result;

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) return result;

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return result;

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  result.days = diffDays + 1;
  result.nights = diffDays;

  return result;
};

const mapTemplateFromApi = (item) => {
  if (!item) return null;
  
  // Парсим timing если это строка JSON
  let timing = item.timing || [];
  if (typeof timing === 'string') {
    try {
      timing = JSON.parse(timing);
    } catch (e) {
      timing = [];
    }
  }
  
  // Приоритет: сначала из timing.length, потом из API (days/nights), потом из дат
  let days = timing?.length || item.days || 0;
  let nights = days > 0 ? days - 1 : (item.nights || 0);
  
  // Если данных нет, вычисляем из дат
  if (days === 0) {
    const computed = computeDuration(item.start_date, item.end_date, item.durationDays, item.nights);
    days = computed.days;
    nights = computed.nights;
  }
  
  const updatedAt = item.updated_at || item.updatedAt || item.created_at || item.createdAt;
  const segments = item.segments ?? item.components?.length ?? 0;
  const category =
    item.category ||
    (item.status === 'archived'
      ? 'archived'
      : days <= 1
      ? 'day'
      : 'multi');

  return {
    ...item,
    durationDays: days,
    nights,
    segments,
    updatedAt,
    updatedLabel: item.updatedLabel || formatUpdatedLabel(updatedAt),
    category,
    type: item.type || 'all',
    direction: item.direction || 'all',
    location: item.location || '—',
    components: item.components,
    timing: timing,
  };
};

const defaultFilters = {
  type: 'all',
  direction: 'all',
  sort: 'newest',
  highlight: null,
};

export default function TemplatesPage({ templates = [], companyId }) {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
  const [data, setData] = useState(SAMPLE_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  useEffect(() => {
    const source = templates?.length ? templates.map(mapTemplateFromApi).filter(Boolean) : SAMPLE_TEMPLATES;
    setData(source);
    setSelectedTemplateId((prev) => (prev && source.some((item) => item.id === prev) ? prev : null));
  }, [templates]);

  const reloadTemplates = useCallback(
    async (signal) => {
      if (!companyId) return;
      setListLoading(true);
      setListError(null);
      try {
        const response = await fetch(`/api/v1/company/templates/list?company_id=${companyId}`, {
          signal,
          credentials: 'same-origin',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Не удалось загрузить шаблоны');
        }
        const payload = await response.json();
        const mapped = (payload.templates || []).map(mapTemplateFromApi).filter(Boolean);
        setData(mapped);
        setSelectedTemplateId((prev) => (prev && mapped.some((item) => item.id === prev) ? prev : null));
      } catch (error) {
        if (error.name === 'AbortError') return;
        setListError(error.message);
      } finally {
        if (signal?.aborted) return;
        setListLoading(false);
      }
    },
    [companyId]
  );

  useEffect(() => {
    const controller = new AbortController();
    reloadTemplates(controller.signal);
    return () => controller.abort();
  }, [companyId, reloadTemplates]);

  useEffect(() => {
    if (!selectedTemplateId || !companyId) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();

    const loadDetail = async () => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await fetch(`/api/v1/company/templates/${selectedTemplateId}`, {
          signal: controller.signal,
          credentials: 'same-origin',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Не удалось загрузить шаблон');
        }
        const payload = await response.json();
        const mapped = mapTemplateFromApi(payload.template);
        setDetail(mapped);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setDetail(null);
        setDetailError(error.message);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();

    return () => controller.abort();
  }, [selectedTemplateId, companyId]);

  const filteredTemplates = useMemo(() => {
    let result = [...data];

    if (category !== 'all') {
      result = result.filter((item) => item.category === category);
    }

    if (filters.type !== 'all') {
      result = result.filter((item) => item.type === filters.type);
    }

    if (filters.direction !== 'all') {
      result = result.filter((item) => item.direction === filters.direction);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q)
      );
    }

    if (filters.highlight === 'popular') {
      result.sort((a, b) => (b.segments || 0) - (a.segments || 0));
    } else if (filters.highlight === 'recent') {
      result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else {
      switch (filters.sort) {
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'segments':
          result.sort((a, b) => (b.segments || 0) - (a.segments || 0));
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
          break;
      }
    }

    return result;
  }, [data, category, filters, query]);

  useEffect(() => {
    if (filteredTemplates.length === 0) {
      setSelectedTemplateId(null);
      return;
    }

    if (!selectedTemplateId) return;

    const exists = filteredTemplates.some((item) => item.id === selectedTemplateId);
    if (!exists) {
      setSelectedTemplateId(null);
    }
  }, [filteredTemplates, selectedTemplateId]);

  const selectedTemplate =
    detail ||
    filteredTemplates.find((item) => item.id === selectedTemplateId) ||
    data.find((item) => item.id === selectedTemplateId);

  const handleCreateTemplate = () => {
    if (!companyId) return;
    // Открываем редактор в режиме создания (без templateId)
    setEditingTemplateId(null);
    setEditorOpen(true);
  };

  const handleExport = () => {
    // UI stub, API wiring can be added later
    console.log('Export templates clicked');
  };

  const handleReset = () => {
    setCategory('all');
    setQuery('');
    setFilters({ ...defaultFilters });
  };

  const handleCloseDetails = () => {
    setSelectedTemplateId(null);
    setDetail(null);
  };

  const handleOpenEditor = () => {
    if (!selectedTemplateId || !companyId) return;
    setEditingTemplateId(selectedTemplateId);
    setEditorOpen(true);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8 h-full">
        <TemplateHeader onCreate={handleCreateTemplate} onExport={handleExport} />

        <TemplateFilters
          categories={TEMPLATE_CATEGORIES}
          category={category}
          onCategoryChange={setCategory}
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={setFilters}
          typeOptions={TEMPLATE_TYPES}
          directionOptions={TEMPLATE_DIRECTIONS}
          onReset={handleReset}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <TemplatesList
            templates={filteredTemplates}
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
            loading={listLoading}
            error={listError}
          />

          <TemplateDetails
            template={selectedTemplate}
            loading={detailLoading}
            error={detailError}
            onClose={handleCloseDetails}
            onOpenEditor={handleOpenEditor}
          />
        </div>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-y-auto">
          <TemplateEditor
            companyId={companyId}
            templateId={editingTemplateId}
            onClose={() => {
              setEditorOpen(false);
              setEditingTemplateId(null);
            }}
            onSaved={async () => {
              await reloadTemplates();
              setEditorOpen(false);
              setEditingTemplateId(null);
              window.location.reload();
            }}
          />
        </div>
      )}
    </main>
  );
}
