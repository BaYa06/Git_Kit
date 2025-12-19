import { useMemo, useState } from 'react';

const sampleGuides = [
  {
    id: 'G-1024',
    name: 'Алексей Смирнов',
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrmdZ36MpQ_HB2vIQC-wcox9UPRbV6A9eW4HPO15gcBcVMXaJlWo_p5VoYzTr2Y-5pXmOaky_U33V6TsUAZyu5jpHwpezrx4Tro0MK5ImvhX4m_wMqNoDJmdzLkZCNnw7Ch_8edImI3k8rNobfIMmG5Ssv3gDEm0izmpGxLGPhQuPUGnK5T1m9xBhsWO99_G0_7J4xh6W7cuHKG5EBXgh3VMY8lirA8BlBfIQqmZ_9p7_Ii4Pq2WomfdbZOdT-lbqCnW6Smrn4rm8",
    phone: '+7 (921) 555-01-23',
    email: 'alex@example.com',
    languages: ['ru', 'en'],
    status: 'Active',
    rating: 4.9,
    reviews: 42,
  },
  {
    id: 'G-1025',
    name: 'Мария Иванова',
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQJjCZXOMIYeF6T6rwkS54mpoOUit5pMygT7lbfR21EJPCGEq8ejwY7PrHR_ChfQr6d9WB86I3lmNXKrfbJ5OHuICK_Xo8LfN_z63qCoLCxcQ_LmH42mbVFsoyVGvoZ-BZ8ChTIS7tEmx046bL-113t4kFyH6TbGSmATjcNt2IlOilsg1FqQI5L1IeF84tAt-v5rk76TqBJWyfkNVJD9J1-8Zq9oQb_7weJBqbmI_8vrmcnxmbyRr1FjKBRmylxfDc9CNzLacaO0A",
    phone: '+7 (921) 123-45-67',
    email: 'maria@example.com',
    languages: ['ru', 'es', 'it'],
    status: 'Active',
    rating: 4.8,
    reviews: 56,
  },
  {
    id: 'G-1026',
    name: 'Дмитрий Петров',
    avatar: null,
    phone: '+7 (911) 987-65-43',
    email: 'dmitry@example.com',
    languages: ['ru'],
    status: 'Archived',
    rating: 0,
    reviews: 0,
  },
  {
    id: 'G-1027',
    name: 'Анна Соколова',
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpEbG1fJ274bPRtt5ABkd_dHTEGBnUKAENSa_oQMYuzWlqL6e9NgD54w7M-NtrUcG3RtsCZpVkrxhadSjoIJu50UNNbiUEbJekAfAgZDIxaCIpQzEVLaB-bghep3DaAtI5vIbl3PMMNbl79_gQHuBBfmVQ7J8bl2GQ_S3krs8X9vcLpCCipStVNh4r2BQaUGI9Dp8P0I9AzbWDKxhH1xTvOhu_6exMBW2C72p3hRodlL1umF_tc7qi4TQfs9CmLhF_CReparNL-0o",
    phone: '+7 (999) 111-22-33',
    email: 'anna@example.com',
    languages: ['ru', 'de'],
    status: 'Active',
    rating: 4.6,
    reviews: 12,
  },
];

const statusBadge = (status) => {
  if (status === 'Active')
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-400">
      Archived
    </span>
  );
};

const sampleHotels = [
  {
    id: 'HT-082',
    name: 'Grand Palace Hotel',
    city: 'Санкт-Петербург',
    stars: 5,
    phone: '+7 (812) 571-00-00',
    meal: 'BB (Завтрак)',
    mealColor: 'purple',
    location: 'Центр, Невский пр.',
    status: 'Active',
    address: 'Россия, г. Санкт-Петербург, Невский проспект, д. 44, лит. А',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvXR4lxSNG93R15M9pP-yaww2feQaExUXHs4OA3luaz7bW2QbKeGWI0cGuSj8fOlu7XZjbN7shOR6jVYuG1XiYLmHyBDgeOrPiC7SGwoFeCTTamHokGf1jeCyT37T6OvZ7XokKyURtH2bNI82vglxfDQdD5TltGv8QahFylgR7SD0mSavHSz8G-euAnoJa8QLjm6cS-EApevrzUhijO8EQG1XCj9fl97bycc6Ga_nYkdPohx9S_k6VgXx6wQmYmrh-yhy2EOFA2GA',
    note: '',
  },
  {
    id: 'HT-094',
    name: 'Sea Breeze Resort',
    city: 'Сочи',
    stars: 4,
    phone: '+7 (862) 222-33-44',
    meal: 'HB (Пансион)',
    mealColor: 'orange',
    location: 'Адлер, 1 линия',
    status: 'Active',
  },
  {
    id: 'HT-105',
    name: 'Mountain View Lodge',
    city: 'Красная Поляна',
    stars: 3,
    phone: '+7 (900) 555-66-77',
    meal: 'RO (Без пит.)',
    mealColor: 'blue',
    location: 'Горная Карусель',
    status: 'Repair',
  },
  {
    id: 'HT-112',
    name: 'Moscow City Hotel',
    city: 'Москва',
    stars: 5,
    phone: '+7 (495) 123-45-67',
    meal: 'BB (Завтрак)',
    mealColor: 'purple',
    location: 'Пресненская наб.',
    status: 'Active',
  },
];

const sampleTransport = [
  {
    id: 'T-204',
    name: 'Mercedes Sprinter',
    type: 'Минивэн',
    typeColor: 'blue',
    plate: 'A 123 AA 777',
    seats: 19,
    driverName: 'А. Смирнов',
    driverAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvXR4lxSNG93R15M9pP-yaww2feQaExUXHs4OA3luaz7bW2QbKeGWI0cGuSj8fOlu7XZjbN7shOR6jVYuG1XiYLmHyBDgeOrPiC7SGwoFeCTTamHokGf1jeCyT37T6OvZ7XokKyURtH2bNI82vglxfDQdD5TltGv8QahFylgR7SD0mSavHSz8G-euAnoJa8QLjm6cS-EApevrzUhijO8EQG1XCj9fl97bycc6Ga_nYkdPohx9S_k6VgXx6wQmYmrh-yhy2EOFA2GA',
    driverPhone: '+7 (921) 555-01-23',
    phoneShort: '921-555...',
    status: 'Active',
    note: 'Микрофон исправен. Последнее ТО пройдено 15.05.2023. Есть детское кресло в багажнике.',
  },
  {
    id: 'T-205',
    name: 'Yutong ZK6122H9',
    type: 'Автобус',
    typeColor: 'purple',
    plate: 'K 001 EM 777',
    seats: 53,
    driverName: 'М. Иванова',
    driverAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQJjCZXOMIYeF6T6rwkS54mpoOUit5pMygT7lbfR21EJPCGEq8ejwY7PrHR_ChfQr6d9WB86I3lmNXKrfbJ5OHuICK_Xo8LfN_z63qCoLCxcQ_LmH42mbVFsoyVGvoZ-BZ8ChTIS7tEmx046bL-113t4kFyH6TbGSmATjcNt2IlOilsg1FqQI5L1IeF84tAt-v5rk76TqBJWyfkNVJD9J1-8Zq9oQb_7weJBqbmI_8vrmcnxmbyRr1FjKBRmylxfDc9CNzLacaO0A',
    driverPhone: '+7 (999) 123-45-67',
    phoneShort: '999-123...',
    status: 'Active',
    note: 'Длинные рейсы, свежая химчистка салона.',
  },
  {
    id: 'T-199',
    name: 'Hyundai H-1',
    type: 'Минивэн',
    typeColor: 'blue',
    plate: 'C 789 CC 77',
    seats: 8,
    driverName: 'Д. Петров',
    driverAvatar: null,
    driverPhone: '+7 (911) 987-65-43',
    phoneShort: '911-987...',
    status: 'Repair',
    note: 'На сервисе до 20.12. Проверить кондиционер.',
  },
];

const mealBadge = (meal, color) => {
  const colors = {
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${colors[color] || colors.purple}`}>
      {meal}
    </span>
  );
};

const starRow = (count) => (
  <div className="flex items-center text-[18px]">
    {Array.from({ length: 5 }).map((_, idx) => (
      <span
        key={idx}
        className={`material-symbols-outlined ${idx < count ? 'star-icon' : 'star-icon-empty text-gray-600'}`}
      >
        star
      </span>
    ))}
  </div>
);

export default function BasePage({ guides = [], hotels = [], drivers = [] }) {
  const guidesData = useMemo(() => {
    if (guides && guides.length) {
      return guides.map((g) => ({
        id: g.id,
        name: g.full_name || g.name || 'Без имени',
        avatar: g.logo_url,
        phone: g.phone || '',
        email: g.email || '',
        languages: Array.isArray(g.languages) ? g.languages.map((l) => (l || '').toLowerCase()) : [],
        status: g.is_active === false ? 'Archived' : 'Active',
        rating: Number(g.avg_rating || 0),
        reviews: Number(g.reviews_count || 0),
        notes: g.notes || '',
      }));
    }
    return sampleGuides;
  }, [guides]);

  const hotelsData = useMemo(() => (hotels && hotels.length ? hotels : sampleHotels), [hotels]);
  const transportData = useMemo(() => {
    if (drivers && drivers.length) {
      return drivers.map((d) => ({
        id: d.id,
        name: d.car_name || 'Без названия',
        type: 'Транспорт',
        typeColor: 'blue',
        plate: d.plate_number || '',
        seats: d.seats || '-',
        driverName: d.full_name || '',
        driverAvatar: null,
        driverPhone: d.phone || '',
        phoneShort: (d.phone || '').slice(0, 7),
        status: 'Active',
        note: d.notes || '',
      }));
    }
    return sampleTransport;
  }, [drivers]);

  const [activeTab, setActiveTab] = useState('guides');
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState(hotelsData[0]?.id || sampleHotels[0].id);
  const [selectedTransportId, setSelectedTransportId] = useState(transportData[0]?.id || sampleTransport[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | archived
  const [sortOption, setSortOption] = useState('name'); // name | rating
  const [languageFilter, setLanguageFilter] = useState('all'); // all | ru | en

  const filteredGuides = useMemo(() => {
    let list = guidesData;
    if (statusFilter === 'active') list = list.filter((g) => g.status === 'Active');
    if (statusFilter === 'archived') list = list.filter((g) => g.status !== 'Active');
    if (languageFilter !== 'all') {
      list = list.filter((g) =>
        (g.languages || []).some((lng) => (lng || '').toLowerCase().startsWith(languageFilter))
      );
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((g) =>
        [g.name, g.phone, g.email].some((field) => (field || '').toLowerCase().includes(q))
      );
    }
    if (sortOption === 'name') {
      list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOption === 'rating') {
      list = [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    return list;
  }, [guidesData, statusFilter, languageFilter, searchTerm, sortOption]);

  const selectedGuide = useMemo(
    () => filteredGuides.find((g) => g.id === selectedGuideId) || null,
    [filteredGuides, selectedGuideId]
  );
  const selectedHotel = useMemo(
    () => hotelsData.find((h) => h.id === selectedHotelId) || hotelsData[0],
    [hotelsData, selectedHotelId]
  );
  const selectedTransport = useMemo(
    () => transportData.find((t) => t.id === selectedTransportId) || transportData[0],
    [transportData, selectedTransportId]
  );

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">База</h1>
            <p className="text-sm text-gray-400">Справочники компании: гиды, отели и локации.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              {activeTab === 'transport' ? 'Экспорт CSV' : 'Экспорт'}
            </button>
            <div className="relative flex">
              <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                {activeTab === 'transport' ? 'Добавить транспорт' : activeTab === 'hotels' ? 'Добавить отель' : 'Добавить'}
              </button>
              <button className="ml-[1px] flex items-center rounded-r-xl border-l border-white/20 bg-primary px-2 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined text-white text-[18px]">arrow_drop_down</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('guides')}
            className={`rounded-full px-5 py-2 text-sm font-semibold shadow-md transition-colors ${
              activeTab === 'guides' ? 'bg-primary text-white shadow-primary/20' : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Гиды
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === 'hotels'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Отели
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === 'transport'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Транспорт
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className="rounded-full bg-transparent px-5 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            Локации
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-[280px]">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder={
                  activeTab === 'hotels'
                    ? 'Поиск по названию, городу или телефону...'
                    : activeTab === 'transport'
                      ? 'Поиск по модели/номеру...'
                      : 'Поиск по ФИО, телефону или ID...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                {activeTab === 'hotels' ? (
                  <select className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer min-w-[130px]">
                    <option>Звёздность</option>
                    <option>5 ★</option>
                    <option>4 ★</option>
                    <option>3 ★</option>
                  </select>
                ) : activeTab === 'transport' ? (
                  <select className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer">
                    <option>Тип транспорта</option>
                    <option>Автобус</option>
                    <option>Микроавтобус</option>
                    <option>Минивэн</option>
                  </select>
                ) : (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активен</option>
                    <option value="archived">В архиве</option>
                  </select>
                )}
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
              <div className="relative">
                {activeTab === 'hotels' ? (
                  <select className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer min-w-[130px]">
                    <option>Питание</option>
                    <option>Завтрак</option>
                    <option>HB (полупансион)</option>
                    <option>FB (полный)</option>
                  </select>
                ) : activeTab === 'transport' ? (
                  <select className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer">
                    <option>Вместимость</option>
                    <option>16-30 мест</option>
                    <option>30-45 мест</option>
                    <option>46+ мест</option>
                  </select>
                ) : (
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="name">По алфавиту (А-Я)</option>
                    <option value="rating">По рейтингу</option>
                  </select>
                )}
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">
                  {activeTab === 'hotels' ? 'expand_more' : activeTab === 'transport' ? 'expand_more' : 'sort'}
                </span>
              </div>
              {(activeTab === 'hotels' || activeTab === 'transport') && (
                <div className="relative min-w-[130px]">
                  <select className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 pl-4 pr-10 py-2.5 text-sm text-white focus:border-primary focus:ring-primary outline-none cursor-pointer">
                    <option>Статус</option>
                    <option>Активен</option>
                    <option>В архиве</option>
                    {activeTab === 'transport' && <option>В ремонте</option>}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <button
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLanguageFilter('all');
                setSortOption('name');
              }}
            >
              Сбросить
            </button>
            <div className="flex items-center gap-2">
              {activeTab === 'hotels' ? (
                <>
                  <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    5★
                  </button>
                  <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    С завтраком
                  </button>
                  <button className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    Только активные
                  </button>
                </>
              ) : activeTab === 'transport' ? (
                <>
                  <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    Автобус
                  </button>
                  <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                    46+ мест
                  </button>
                  <button className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    Только активные
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLanguageFilter((prev) => (prev === 'ru' ? 'all' : 'ru'))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      languageFilter === 'ru'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Русский
                  </button>
                  <button
                    onClick={() => setLanguageFilter((prev) => (prev === 'en' ? 'all' : 'en'))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      languageFilter === 'en'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setStatusFilter((prev) => (prev === 'active' ? 'all' : 'active'))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === 'active'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    Только активные
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Transport Table + Detail */}
        {activeTab === 'transport' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`${selectedTransport ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-white/5 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-4 w-[50px]">
                        <input className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                      </th>
                      <th className="px-4 py-4">Транспорт / ID</th>
                      <th className="px-4 py-4">Тип</th>
                      <th className="px-4 py-4">Гос. номер</th>
                      <th className="px-4 py-4">Мест</th>
                      <th className="px-4 py-4">Водитель</th>
                      <th className="px-4 py-4">Телефон</th>
                      <th className="px-4 py-4">Статус</th>
                      <th className="px-4 py-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {transportData.map((t, idx) => (
                      <tr
                        key={t.id}
                        className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          selectedTransportId === t.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedTransportId(t.id)}
                      >
                        <td className="px-4 py-4">
                          <input
                            className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0"
                            type="checkbox"
                            checked={selectedTransportId === t.id}
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="text-xs">ID: #{t.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                              t.typeColor === 'purple'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/10'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/10'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-white text-xs">{t.plate}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-white">{t.seats}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {t.driverAvatar ? (
                              <div className="size-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${t.driverAvatar})` }} />
                            ) : (
                              <div className="size-6 rounded-full bg-surface-dark flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/10">
                                {t.driverName?.slice(0, 2) || ''}
                              </div>
                            )}
                            <span className="text-white text-xs">{t.driverName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <a className="text-xs text-gray-300 hover:text-primary flex items-center gap-1" href="#">
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            {t.phoneShort}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          {t.status === 'Active' ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                              Repair
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[16px]">
                                {t.status === 'Active' ? 'archive' : 'unarchive'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02] mt-auto">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">Показывать строк:</span>
                  <select className="rounded-lg border border-white/10 bg-black/20 py-1 pl-2 pr-6 text-xs text-white focus:border-primary focus:ring-0">
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">Показано 1–20 из 120</span>
                  <div className="flex items-center gap-1">
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
                <div className="size-24 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mb-4 ring-4 ring-white/5 shadow-xl">
                  <span className="material-symbols-outlined text-4xl text-gray-400">directions_bus</span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">{selectedTransport?.name}</h2>
                <span className="text-xs text-gray-500 mb-2">ID: #{selectedTransport?.id}</span>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xl text-white bg-white/10 px-3 py-1 rounded-lg border border-white/5 tracking-widest">
                    {selectedTransport?.plate}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 border border-blue-500/20">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>
                  {selectedTransport?.seats} мест
                </span>
              </div>

              <div className="py-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Водитель</label>
                    <button className="text-xs text-primary hover:text-white transition-colors">История</button>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                    {selectedTransport?.driverAvatar ? (
                      <div className="size-12 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${selectedTransport?.driverAvatar})` }} />
                    ) : (
                      <div className="size-12 rounded-full bg-surface-dark flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/10">
                        {selectedTransport?.driverName?.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-white">{selectedTransport?.driverName}</span>
                      <a
                        className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                        href={`tel:${selectedTransport?.driverPhone?.replace(/[()\\s-]/g, '') || ''}`}
                      >
                        {selectedTransport?.driverPhone}
                      </a>
                    </div>
                    <button className="size-9 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заметки</label>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-h-[80px]">
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedTransport?.note}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  Редактировать
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">archive</span>
                    Архив
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    Контакты
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guides Table + Detail */}
        {activeTab === 'guides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`${selectedGuide ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-white/5 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 w-[50px]">
                        <input className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                      </th>
                      <th className="px-6 py-4">Гиды (ФИО)</th>
                      <th className="px-6 py-4">Контакты</th>
                      <th className="px-6 py-4">Языки</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredGuides.map((g) => (
                      <tr
                        key={g.id}
                        className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          selectedGuideId === g.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedGuideId(g.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0"
                            type="checkbox"
                            checked={selectedGuideId === g.id}
                            readOnly
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {g.avatar ? (
                              <div className="size-9 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${g.avatar})` }} />
                            ) : (
                              <div className="size-9 rounded-full bg-surface-dark flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10">
                                {g.name?.slice(0, 2) || 'Г'}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{g.name}</span>
                              <span className="text-xs">ID: #{g.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white">{g.phone}</span>
                            <span className="text-xs text-blue-400">{g.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {g.languages?.map((lang) => (
                              <span key={lang} className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                                {(lang || '').toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">{statusBadge(g.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">archive</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredGuides.length && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          Ничего не найдено по выбранным фильтрам
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">Показывать строк:</span>
                  <select className="rounded-lg border border-white/10 bg-black/20 py-1 pl-2 pr-6 text-xs text-white focus:border-primary focus:ring-0">
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
                    <button className="text-xs font-medium text-primary hover:text-white transition-colors">Экспорт (1)</button>
                    <button className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors">Архивировать (1)</button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">1–4 из 4</span>
                  <div className="flex items-center gap-1">
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            {selectedGuide && (
              <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6">
                <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
                  <div
                    className="size-24 rounded-full bg-cover bg-center mb-4 ring-4 ring-white/5"
                    style={{ backgroundImage: `url(${selectedGuide?.avatar || ''})` }}
                  ></div>
                  <h2 className="text-xl font-bold text-white">{selectedGuide?.name}</h2>
                  <span className="text-sm text-gray-500 mb-2">ID: #{selectedGuide?.id}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                      {selectedGuide?.status === 'Active' ? 'Active' : 'Archived'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-gray-200 border border-white/10">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      {selectedGuide?.rating?.toFixed(1) || '0.0'}
                      <span className="text-[10px] text-gray-400">({selectedGuide?.reviews || 0})</span>
                    </span>
                  </div>
                </div>

                <div className="py-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Контакты</label>
                    <a className="text-lg font-medium text-primary hover:underline hover:text-primary/80 transition-colors" href={`tel:${selectedGuide?.phone}`}>
                      {selectedGuide?.phone}
                    </a>
                    {selectedGuide?.email && (
                      <a className="text-sm text-gray-300 hover:text-primary transition-colors" href={`mailto:${selectedGuide?.email}`}>
                        {selectedGuide?.email}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Языки</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide?.languages?.map((lang) => (
                        <span key={lang} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-200 border border-white/10">
                          {(lang || '').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заметки</label>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-h-[80px]">
                      <p className="text-sm text-gray-300 leading-relaxed">{selectedGuide?.notes || 'Нет заметок'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hotels Table + Detail */}
        {activeTab === 'hotels' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`${selectedHotel ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl flex flex-col overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-white/5 text-xs font-medium uppercase tracking-wider text-gray-500 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 w-[50px]">
                        <input className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                      </th>
                      <th className="px-6 py-4">Название отеля</th>
                      <th className="px-6 py-4">Звёзды</th>
                      <th className="px-6 py-4">Контакты</th>
                      <th className="px-6 py-4">Питание</th>
                      <th className="px-6 py-4">Локация</th>
                      <th className="px-6 py-4">Статус</th>
                      <th className="px-6 py-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {hotelsData.map((h, idx) => (
                      <tr
                        key={h.id}
                        className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          selectedHotelId === h.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedHotelId(h.id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            className="rounded border-gray-600 bg-surface-dark/50 text-primary focus:ring-primary focus:ring-offset-0"
                            type="checkbox"
                            checked={selectedHotelId === h.id}
                            readOnly
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[15px]">{h.name}</span>
                            <span className="text-xs text-gray-500">
                              ID: #{h.id} • {h.city}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{starRow(h.stars || 0)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white">
                            <span className="material-symbols-outlined text-[16px] text-gray-500">call</span>
                            <span className="text-xs">{h.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{mealBadge(h.meal, h.mealColor)}</td>
                        <td className="px-6 py-4 text-xs text-gray-300">{h.location}</td>
                        <td className="px-6 py-4">
                          {h.status === 'Active' ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Active</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-500/20 px-2.5 py-0.5 text-xs font-medium text-gray-400">{h.status}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">archive</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02] mt-auto">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">Показывать строк:</span>
                  <select className="rounded-lg border border-white/10 bg-black/20 py-1 pl-2 pr-6 text-xs text-white focus:border-primary focus:ring-0">
                    <option>20</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">Показано 1–20 из 180</span>
                  <div className="flex items-center gap-1">
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:bg-white/5 hover:text-white">
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 sticky top-6 h-fit">
              <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
                <div
                  className="size-24 rounded-2xl bg-cover bg-center mb-4 ring-1 ring-white/10 shadow-lg"
                  style={{ backgroundImage: `url(${selectedHotel?.image || ''})` }}
                ></div>
                <h2 className="text-xl font-bold text-white">{selectedHotel?.name}</h2>
                <span className="text-sm text-gray-500 mb-2">ID: #{selectedHotel?.id}</span>
                <div className="flex items-center gap-1 text-[16px] mb-3">{starRow(selectedHotel?.stars || 0)}</div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                  Доступен для бронирования
                </span>
              </div>

              <div className="py-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ресепшн</label>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-dark/30 border border-white/10">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{selectedHotel?.phone}</span>
                      <span className="text-xs text-gray-500">Круглосуточно</span>
                    </div>
                    <button className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Детали</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-surface-dark/30 p-3 border border-white/10">
                      <span className="text-xs text-gray-500 block mb-1">Питание</span>
                      <span className="text-sm font-medium text-white">{selectedHotel?.meal}</span>
                    </div>
                    <div className="rounded-xl bg-surface-dark/30 p-3 border border-white/10">
                      <span className="text-xs text-gray-500 block mb-1">Рейтинг</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white">4.9</span>
                        <span className="text-[10px] text-gray-500">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Адрес</label>
                  <div className="rounded-xl bg-surface-dark/30 p-3 border border-white/10 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-gray-500 text-[18px] mt-0.5">location_on</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedHotel?.address}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заметки</label>
                  <textarea
                    className="w-full h-20 rounded-xl bg-surface-dark/30 border border-white/10 p-3 text-sm text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    placeholder="Добавить заметку..."
                    defaultValue={selectedHotel?.note || ''}
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    Редактировать
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface-dark/50 border border-white/10 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    Контакты
                  </button>
                </div>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all">
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                  Архивировать отель
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
