export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'day', label: 'Однодневные' },
  { id: 'multi', label: 'Многодневные' },
  { id: 'archived', label: 'Архив' },
];

export const TEMPLATE_TYPES = [
  { id: 'all', label: 'Тип: Все' },
  { id: 'excursion', label: 'Экскурсия' },
  { id: 'trekking', label: 'Треккинг' },
  { id: 'cultural', label: 'Культура' },
];

export const TEMPLATE_DIRECTIONS = [
  { id: 'all', label: 'Направление' },
  { id: 'Алтай', label: 'Алтай' },
  { id: 'Байкал', label: 'Байкал' },
  { id: 'СПб', label: 'СПб' },
  { id: 'Кыргызстан', label: 'Кыргызстан' },
  { id: 'ЦФО', label: 'ЦФО' },
];

export const SAMPLE_TEMPLATES = [
  {
    id: 'TMP-2024-001',
    name: 'Горный Алтай: Места Силы',
    category: 'multi',
    type: 'trekking',
    direction: 'Алтай',
    location: 'Россия, Республика Алтай',
    durationDays: 8,
    nights: 7,
    segments: 12,
    updatedLabel: 'Сегодня, 14:30',
    updatedAt: '2024-10-15T14:30:00Z',
    status: 'active',
    tags: [
      { label: '8 days', tone: 'blue' },
      { label: 'Active', tone: 'emerald' },
      { label: 'Adventure', tone: 'neutral' },
    ],
    checklist: {
      ready: 0.8,
      items: [
        { label: 'Маршрут', state: 'done' },
        { label: 'Отели', state: 'done' },
        { label: 'Трансфер', state: 'progress' },
      ],
    },
    itinerary: [
      { label: 'День 1: Прилет в Горно-Алтайск', description: 'Встреча, трансфер, заселение', state: 'done' },
      { label: 'День 2: Чуйский тракт', description: 'Экскурсия, обед в горах', state: 'idle' },
      { label: 'День 3: Гейзерное озеро', description: 'Треккинг 5км, фотосессия', state: 'idle' },
    ],
    extraDays: 5,
  },
  {
    id: 'TMP-2024-002',
    name: 'Золотое Кольцо Express',
    category: 'day',
    type: 'cultural',
    direction: 'ЦФО',
    location: 'Россия, ЦФО',
    durationDays: 3,
    nights: 2,
    segments: 5,
    updatedLabel: 'Вчера',
    updatedAt: '2024-10-14T09:00:00Z',
    status: 'draft',
    tags: [
      { label: '3 days', tone: 'blue' },
      { label: 'Активный', tone: 'emerald' },
    ],
    checklist: {
      ready: 0.55,
      items: [
        { label: 'Маршрут', state: 'done' },
        { label: 'Отели', state: 'progress' },
        { label: 'Трансфер', state: 'idle' },
      ],
    },
    itinerary: [
      { label: 'День 1: Москва', description: 'Обзорка, встреча группы', state: 'done' },
      { label: 'День 2: Суздаль', description: 'Исторические места, дегустации', state: 'progress' },
      { label: 'День 3: Владимир', description: 'Возвращение, покупки', state: 'idle' },
    ],
    extraDays: 0,
  },
  {
    id: 'TMP-2024-003',
    name: 'Вокруг Иссык-Куля',
    category: 'multi',
    type: 'excursion',
    direction: 'Кыргызстан',
    location: 'Кыргызстан',
    durationDays: 5,
    nights: 4,
    segments: 8,
    updatedLabel: '10 Окт',
    updatedAt: '2024-10-10T12:00:00Z',
    status: 'active',
    tags: [
      { label: '5 days', tone: 'blue' },
      { label: 'Active', tone: 'emerald' },
    ],
    checklist: {
      ready: 0.65,
      items: [
        { label: 'Маршрут', state: 'done' },
        { label: 'Отели', state: 'progress' },
        { label: 'Трансфер', state: 'progress' },
      ],
    },
    itinerary: [
      { label: 'День 1: Бишкек', description: 'Прилет, заселение', state: 'done' },
      { label: 'День 2: Иссык-Куль', description: 'Озеро, экскурсия', state: 'progress' },
      { label: 'День 3: Горы', description: 'Треккинг, пикник', state: 'idle' },
    ],
    extraDays: 2,
  },
  {
    id: 'TMP-2024-004',
    name: 'Петербург Достоевского',
    category: 'archived',
    type: 'cultural',
    direction: 'СПб',
    location: 'Россия, СПб',
    durationDays: 1,
    nights: 0,
    segments: 3,
    updatedLabel: '08 Окт',
    updatedAt: '2024-10-08T10:00:00Z',
    status: 'archived',
    tags: [
      { label: '1 day', tone: 'blue' },
      { label: 'Культура', tone: 'neutral' },
    ],
    checklist: {
      ready: 0.4,
      items: [
        { label: 'Маршрут', state: 'progress' },
        { label: 'Отели', state: 'idle' },
        { label: 'Трансфер', state: 'idle' },
      ],
    },
    itinerary: [
      { label: 'День 1: Петербург', description: 'Прогулка, музеи', state: 'progress' },
    ],
    extraDays: 0,
  },
];
