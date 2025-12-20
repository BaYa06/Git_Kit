import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NewTourFromTemplateScreen, TemplatePickerModal } from '../../mobile/ToursTab';

export default function ToursPage({ companyId, guides = [], hotels = [], drivers = [] }) {
  const router = useRouter();
  const { tourId } = router.query;
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourToDelete, setTourToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  
  // Template picker states
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [newTourOpen, setNewTourOpen] = useState(false);
  const [newTourTemplateId, setNewTourTemplateId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);
  
  // Filters
  const [mainFilter, setMainFilter] = useState('upcoming'); // upcoming | past | canceled
  const [quickFilter, setQuickFilter] = useState('all'); // all | planned | confirmed | unassigned | today
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedTours, setSelectedTours] = useState([]);

  useEffect(() => {
    if (!companyId) return;
    
    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/tours/list?company_id=${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch tours');
        
        const data = await response.json();
        setTours(data.tours || []);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [companyId]);

  // Check if we need to open editor from URL
  useEffect(() => {
    if (tourId) {
      setEditingTourId(tourId);
    }
  }, [tourId]);

  // Load templates
  useEffect(() => {
    if (!companyId) return;
    
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const response = await fetch(`/api/v1/company/templates/list?company_id=${companyId}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Не удалось загрузить шаблоны');
        }
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplatesError(error.message);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [companyId]);

  // Filter tours
  const getFilteredTours = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filtered = tours.filter(tour => {
      // Main filter
      const tourDate = tour.start_date ? new Date(tour.start_date) : null;
      if (mainFilter === 'upcoming' && tourDate && tourDate < today) return false;
      if (mainFilter === 'past' && tourDate && tourDate >= today) return false;
      if (mainFilter === 'canceled' && tour.status !== 'canceled') return false;
      
      // Search
      if (searchQuery && !tour.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Quick filters
      if (quickFilter === 'planned' && tour.status !== 'planned') return false;
      if (quickFilter === 'confirmed' && tour.status !== 'confirmed' && tour.status !== 'active') return false;
      if (quickFilter === 'unassigned' && tour.main_guide_name) return false;
      if (quickFilter === 'today' && tourDate) {
        const todayTime = today.getTime();
        const tourTime = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate()).getTime();
        if (tourTime !== todayTime) return false;
      }
      
      return true;
    });
    
    // Сортировка по дате от ближайших к дальним
    filtered.sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateA - dateB;
    });
    
    return filtered;
  };

  const filteredTours = getFilteredTours();
  const paginatedTours = filteredTours.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredTours.length / rowsPerPage);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const formatDayOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          ring: 'ring-emerald-500/20',
          label: 'Confirmed',
        };
      case 'planned':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          ring: 'ring-yellow-500/20',
          label: 'Planned',
        };
      case 'canceled':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          ring: 'ring-red-500/20',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          ring: 'ring-gray-500/20',
          label: 'Unknown',
        };
    }
  };

  const getStatusCounts = () => {
    const planned = filteredTours.filter(t => t.status === 'planned').length;
    const confirmed = filteredTours.filter(t => t.status === 'confirmed' || t.status === 'active').length;
    return { planned, confirmed };
  };

  const statusCounts = getStatusCounts();

  const handleToggleAll = (checked) => {
    if (checked) {
      setSelectedTours(paginatedTours.map(t => t.id));
    } else {
      setSelectedTours([]);
    }
  };

  const handleToggleTour = (tourId) => {
    setSelectedTours(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setQuickFilter('all');
  };

  const handleDeleteTour = async () => {
    if (!tourToDelete) return;
    
    setDeleting(true);
  const handleTemplatePicked = (template) => {
    if (!template) return;
    setNewTourTemplateId(template.id);
    setEditingTourId(null);
    setTemplatePickerOpen(false);
    setNewTourOpen(true);
  };

  const reloadTours = async () => {
    try {
      const response = await fetch(`/api/v1/tours/list?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours || []);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

    try {
      const response = await fetch(`/api/v1/tours/${tourToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to delete tour');
      
      // Удаляем тур из списка
      setTours(prev => prev.filter(t => t.id !== tourToDelete.id));
      
      // Закрываем детали если удаленный тур был выбран
      if (selectedTour?.id === tourToDelete.id) {
        setSelectedTour(null);
      }
      
      // Закрываем модальное окно
      setTourToDelete(null);
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Ошибка при удалении тура');
    } finally {
      setDeleting(false);
    }
  };

  const handleTemplatePicked = (template) => {
    if (!template) return;
    setNewTourTemplateId(template.id);
    setEditingTourId(null);
    setTemplatePickerOpen(false);
    setNewTourOpen(true);
  };

  const reloadTours = async () => {
    try {
      const response = await fetch(`/api/v1/tours/list?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours || []);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Page Header */}
      <div className="shrink-0 p-6 pb-0 flex flex-col gap-6 z-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Все туры</h1>
            <p className="text-sm text-gray-400">Управление расписанием и статусами групп</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-dark/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-surface-dark transition-colors">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
              Экспорт
            </button>
            <button 
              onClick={() => setTemplatePickerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Создать тур из шаблона
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex w-fit rounded-full bg-surface-dark/50 border border-white/10 p-1">
            <button 
              onClick={() => setMainFilter('upcoming')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                mainFilter === 'upcoming' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Предстоящие
            </button>
            <button 
              onClick={() => setMainFilter('past')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                mainFilter === 'past' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Прошедшие
            </button>
            <button 
              onClick={() => setMainFilter('canceled')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                mainFilter === 'canceled' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Отменённые
            </button>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full lg:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input 
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="Поиск тура..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10">
                <span className="text-gray-400 text-xs">From</span>
                <input 
                  className="bg-transparent border-none p-0 text-sm text-white w-12 focus:ring-0 placeholder-gray-600" 
                  placeholder="DD.MM" 
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-gray-600">-</span>
                <span className="text-gray-400 text-xs">To</span>
                <input 
                  className="bg-transparent border-none p-0 text-sm text-white w-12 focus:ring-0 placeholder-gray-600" 
                  placeholder="DD.MM" 
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <span className="material-symbols-outlined text-gray-400 text-[18px]">calendar_today</span>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setQuickFilter('all')}
                  className={`rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition ${
                    quickFilter === 'all' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Все
                </button>
                <button 
                  onClick={() => setQuickFilter('planned')}
                  className={`rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition ${
                    quickFilter === 'planned' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Собирается
                </button>
                <button 
                  onClick={() => setQuickFilter('confirmed')}
                  className={`rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition ${
                    quickFilter === 'confirmed' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Подтверждено
                </button>
                <button 
                  onClick={() => setQuickFilter('unassigned')}
                  className={`rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition ${
                    quickFilter === 'unassigned' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Без гида
                </button>
                <button 
                  onClick={() => setQuickFilter('today')}
                  className={`rounded-lg border border-white/10 px-3 py-2 text-xs font-medium transition ${
                    quickFilter === 'today' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Сегодня
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-center gap-4 w-full lg:w-auto justify-end border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
              <button 
                onClick={handleResetFilters}
                className="text-xs font-medium text-primary hover:text-white transition-colors"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-6 pt-4">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tours Table */}
          <div className={`${selectedTour ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col h-full glass-card rounded-2xl overflow-hidden`}>
            {/* Table Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="text-xs font-medium text-gray-400">
                Показано {filteredTours.length > 0 ? ((page - 1) * rowsPerPage) + 1 : 0}–{Math.min(page * rowsPerPage, filteredTours.length)} из {filteredTours.length}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-yellow-400"></span>
                  <span className="text-xs font-medium text-gray-300">
                    Planned: <span className="text-white">{statusCounts.planned}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-medium text-gray-300">
                    Confirmed: <span className="text-white">{statusCounts.confirmed}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1F2937] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3 pl-5 pr-2 w-10 border-b border-white/10">
                      <input 
                        className="rounded border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 size-4" 
                        type="checkbox"
                        checked={selectedTours.length === paginatedTours.length && paginatedTours.length > 0}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Дата</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Тур</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Статус</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Гид</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Транспорт</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Отель</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10">Оплата</th>
                    <th className="py-3 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10 w-24">Места</th>
                    <th className="py-3 pl-2 pr-5 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-white/10 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-3 text-sm text-gray-400">Загрузка...</p>
                      </td>
                    </tr>
                  ) : paginatedTours.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <span className="material-symbols-outlined text-gray-600 text-[48px]">event_busy</span>
                        <p className="mt-3 text-sm text-gray-400">Туры не найдены</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTours.map((tour) => {
                      const statusColors = getStatusColor(tour.status);
                      const isSelected = selectedTours.includes(tour.id);
                      const fillPercentage = tour.tourists_count > 0 
                        ? ((tour.tourists_signed || 0) / tour.tourists_count) * 100 
                        : 0;
                      
                      const primaryGuide =
                        tour.main_guide_name ||
                        (Array.isArray(tour.guide_names) && tour.guide_names[0]) ||
                        null;

                      return (
                        <tr 
                          key={tour.id} 
                          className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                          onClick={() => setEditingTourId(tour.id)}
                        >
                          <td className="py-3 pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
                            <input 
                              className="rounded border-gray-600 bg-transparent text-primary focus:ring-0 focus:ring-offset-0 size-4" 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleTour(tour.id)}
                            />
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white">
                                {formatDate(tour.start_date)}
                              </span>
                              <span className="text-[10px] text-gray-500 uppercase">
                                {formatDayOfWeek(tour.start_date)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{tour.name}</span>
                              <span className="text-xs text-gray-400">из Москвы</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center rounded-full ${statusColors.bg} px-2 py-0.5 text-xs font-medium ${statusColors.text} ring-1 ring-inset ${statusColors.ring}`}>
                              {statusColors.label}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {primaryGuide ? (
                              <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                                  {primaryGuide[0]}
                                </div>
                                <span className="text-xs text-gray-300 whitespace-nowrap">
                                  {primaryGuide}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-500 text-[18px]">warning</span>
                                <span className="text-xs text-yellow-500 italic whitespace-nowrap">Не назначен</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-xs text-gray-300">
                              {tour.transport_required
                                ? tour.transport_label || 'не выбрано'
                                : 'не нужно'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-xs text-gray-300">
                              {tour.hotel_required
                                ? tour.hotel_label || 'не выбрано'
                                : 'не нужно'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col text-xs text-gray-300">
                              <span className="font-semibold text-white">
                                {Math.round((tour.payment?.paid || 0)).toLocaleString('ru-RU')} / {Math.round((tour.payment?.total || 0)).toLocaleString('ru-RU')} KGS
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Оплата: {tour.payment?.total ? Math.round(((tour.payment.paid || 0) / (tour.payment.total || 1)) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1 w-20">
                              <div className="flex justify-between text-[10px] text-gray-400">
                                <span className="text-white font-medium">{tour.tourists_signed || 0}</span>
                                <span>/ {tour.tourists_count || 0}</span>
                              </div>
                              <div className="h-1 w-full rounded-full bg-gray-700 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    fillPercentage >= 80 ? 'bg-emerald-400' : 
                                    fillPercentage >= 50 ? 'bg-yellow-400' : 
                                    'bg-gray-400'
                                  }`}
                                  style={{ width: `${fillPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pl-2 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="text-gray-400 hover:text-white p-1"
                                onClick={() => router.push(`/company/${companyId}/tours/${tour.id}`)}
                                title="Просмотр"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              <button 
                                className="text-gray-400 hover:text-white p-1"
                                title="Экспорт"
                              >
                                <span className="material-symbols-outlined text-[18px]">ios_share</span>
                              </button>
                              <button 
                                className="text-gray-400 hover:text-red-400 p-1"
                                onClick={() => setTourToDelete(tour)}
                                title="Удалить"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-auto flex items-center justify-between border-t border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Строк на странице:</span>
                <select 
                  className="h-7 rounded-lg border-white/10 bg-white/5 py-0 pl-2 pr-7 text-xs text-white focus:ring-0"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button 
                      key={i}
                      className={`flex size-7 items-center justify-center rounded-lg text-xs font-medium ${
                        page === pageNum 
                          ? 'bg-primary text-white' 
                          : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tour Details Sidebar */}
          {selectedTour && (
            <div className="lg:col-span-4 flex flex-col h-full glass-card rounded-2xl p-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Детали тура</h2>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setSelectedTour(null)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <span className={`inline-flex items-center rounded-full ${getStatusColor(selectedTour.status).bg} px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedTour.status).text} ring-1 ring-inset ${getStatusColor(selectedTour.status).ring} mb-3`}>
                    {getStatusColor(selectedTour.status).label}
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">{selectedTour.name}</h3>
                  <p className="text-sm text-gray-400 mt-2">ID: #{selectedTour.id} • из Москвы</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => router.push(`/company/${companyId}/tours/${selectedTour.id}`)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all"
                  >
                    Открыть тур
                    <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    PDF
                  </button>
                </div>

                <div className="flex flex-col gap-4 rounded-xl bg-surface-dark/40 p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400">
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Даты</p>
                      <p className="text-sm font-medium text-white">
                        {formatDate(selectedTour.start_date)} — {formatDate(selectedTour.end_date)}
                      </p>
                    </div>
                  </div>

                  {selectedTour.main_guide_name && (
                    <>
                      <div className="h-px w-full bg-white/10"></div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Гид</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="size-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                              {selectedTour.main_guide_name[0]}
                            </div>
                            <p className="text-sm font-medium text-white">{selectedTour.main_guide_name}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Заполненность группы</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {selectedTour.tourists_count > 0 
                        ? Math.round(((selectedTour.tourists_signed || 0) / selectedTour.tourists_count) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ 
                        width: `${selectedTour.tourists_count > 0 
                          ? ((selectedTour.tourists_signed || 0) / selectedTour.tourists_count) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedTour.tourists_signed || 0} туристов подтверждено, {(selectedTour.tourists_count || 0) - (selectedTour.tourists_signed || 0)} места свободно
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <span className="material-symbols-outlined text-red-400 text-[28px]">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Удалить тур?</h3>
                <p className="text-sm text-gray-400">
                  Вы уверены, что хотите удалить тур <span className="font-bold text-white">"{tourToDelete.name}"</span>? 
                  Это действие нельзя будет отменить.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setTourToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteTour}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Удаление...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Удалить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Picker Modal */}
      <TemplatePickerModal
        open={templatePickerOpen}
        templates={templates}
        loading={templatesLoading}
        error={templatesError}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectTemplate={handleTemplatePicked}
      />

      {/* New Tour Modal */}
      <NewTourFromTemplateScreen
        open={newTourOpen}
        templateId={newTourTemplateId}
        companyId={companyId}
        guides={guides}
        hotels={hotels}
        drivers={drivers}
        mode="create"
        tourId={null}
        onCreated={() => {
          reloadTours();
          setNewTourOpen(false);
          setNewTourTemplateId(null);
        }}
        onClose={() => {
          setNewTourOpen(false);
          setNewTourTemplateId(null);
        }}
      />

      {/* Tour Editor */}
      <NewTourFromTemplateScreen
        open={!!editingTourId}
        templateId={null}
        companyId={companyId}
        guides={guides}
        hotels={hotels}
        drivers={drivers}
        mode="edit"
        tourId={editingTourId}
        onCreated={() => {
          reloadTours();
        }}
        onClose={() => {
          setEditingTourId(null);
          // Remove tourId from URL if it exists
          if (router.query.tourId) {
            const { tourId, ...rest } = router.query;
            router.replace({
              pathname: router.pathname,
              query: rest
            }, undefined, { shallow: true });
          }
        }}
      />
    </main>
  );
}
