import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DesktopUpcomingTours({ companyId, onTourClick, onShowAllTours }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('today');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Mock data if no tours provided (for development)
  const mockTours = [
    {
      id: 1,
      date: '12 Окт',
      name: 'Городские Легенды',
      guide: 'Алексей Смирнов',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      participants: 12,
      maxParticipants: 15,
    },
    {
      id: 2,
      date: '12 Окт',
      name: 'Вечерний Петербург',
      guide: 'Мария Иванова',
      status: 'planned',
      statusLabel: 'Planned',
      participants: 8,
      maxParticipants: 20,
    },
    {
      id: 3,
      date: '13 Окт',
      name: 'Золотое Кольцо',
      guide: 'Дмитрий Петров',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      participants: 28,
      maxParticipants: 30,
    },
    {
      id: 4,
      date: '13 Окт',
      name: 'Крыши и Дворы',
      guide: 'Анна Соколова',
      status: 'in_progress',
      statusLabel: 'In Progress',
      participants: 10,
      maxParticipants: 10,
    },
  ];

  // Фильтрация туров по датам
  const getFilteredTours = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    const afterAfterTomorrow = new Date(today);
    afterAfterTomorrow.setDate(afterAfterTomorrow.getDate() + 3);

    return tours.filter(tour => {
      if (!tour.start_date) return false;
      
      const tourDate = new Date(tour.start_date);
      const tourDateOnly = new Date(tourDate.getFullYear(), tourDate.getMonth(), tourDate.getDate());

      switch (activeFilter) {
        case 'today':
          return tourDateOnly.getTime() === today.getTime();
        case 'tomorrow':
          return tourDateOnly.getTime() === tomorrow.getTime();
        case 'after_tomorrow':
          return tourDateOnly.getTime() === afterTomorrow.getTime();
        default:
          return false;
      }
    });
  };

  const displayTours = tours.length > 0 ? getFilteredTours() : mockTours;

  // Форматирование даты для отображения
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Подтверждён',
        };
      case 'planned':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          dot: 'bg-yellow-400',
          label: 'Планируется',
        };
      case 'in_progress':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          dot: 'bg-blue-400',
          label: 'В процессе',
        };
      case 'canceled':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          dot: 'bg-red-400',
          label: 'Отменён',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          dot: 'bg-gray-400',
          label: 'Неизвестно',
        };
    }
  };

  const handleTourClick = (tourId) => {
    if (onTourClick) {
      onTourClick(tourId);
    }
  };

  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Ближайшие туры</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activeFilter === 'today'
                ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => setActiveFilter('tomorrow')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              activeFilter === 'tomorrow'
                ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Завтра
          </button>
          <button
            onClick={() => setActiveFilter('after_tomorrow')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              activeFilter === 'after_tomorrow'
                ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Послезавтра
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-2">Дата</div>
          <div className="col-span-4">Название тура</div>
          <div className="col-span-3">Статус</div>
          <div className="col-span-3 text-right">Участники</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-3 text-sm text-gray-400">Загрузка...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayTours.length === 0 && (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-gray-600 text-[48px]">event_busy</span>
            <p className="mt-3 text-sm text-gray-400">Туры не найдены</p>
          </div>
        )}

        {/* Tour Items */}
        {!loading && displayTours.map((tour, index) => {
          const statusColors = getStatusColor(tour.status);
          const isLast = index === displayTours.length - 1;

          return (
            <div
              key={tour.id}
              onClick={() => handleTourClick(tour.id)}
              className={`group grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer ${
                !isLast ? 'border-b border-white/10' : ''
              }`}
            >
              <div className="col-span-2">
                <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20">
                  {tour.start_date ? formatDisplayDate(tour.start_date) : tour.date}
                </span>
              </div>
              <div className="col-span-4 flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                  {tour.name}
                </span>
                <span className="text-xs text-gray-500">
                  Гид: {tour.main_guide_name || (tour.guide_names && tour.guide_names[0]) || tour.guide || 'Не назначен'}
                </span>
              </div>
              <div className="col-span-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full ${statusColors.bg} px-2.5 py-1 text-xs font-medium ${statusColors.text}`}
                >
                  <span className={`size-1.5 rounded-full ${statusColors.dot}`}></span>
                  {statusColors.label}
                </span>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-3">
                <span className="text-sm font-medium text-white">
                  {tour.tourists_signed || tour.participants || 0}
                  <span className="text-gray-500">/{tour.tourists_count || tour.maxParticipants || 0}</span>
                </span>
                <span className="material-symbols-outlined text-gray-600 group-hover:text-white transition-colors text-[20px]">
                  chevron_right
                </span>
              </div>
            </div>
          );
        })}

        {/* Footer */}
        {!loading && displayTours.length > 0 && (
          <div className="px-6 py-3 bg-white/[0.02] text-center border-t border-white/10">
            <button 
              onClick={() => onShowAllTours && onShowAllTours()}
              className="text-xs font-medium text-primary hover:text-white transition-colors"
            >
              Показать все туры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
