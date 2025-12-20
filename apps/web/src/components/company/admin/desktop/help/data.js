export const helpTabs = [
  { id: 'knowledge', label: 'База знаний', active: true },
  { id: 'tickets', label: 'Мои обращения' },
  { id: 'contact', label: 'Связаться' },
  { id: 'status', label: 'Статус' },
];

export const categories = [
  {
    id: 'tours',
    title: 'Туры',
    description: 'Создание, редактирование программ, настройка маршрутов и дат.',
    icon: 'hiking',
    tone: 'blue',
  },
  {
    id: 'templates',
    title: 'Шаблоны',
    description: 'Управление шаблонами туров для быстрого запуска новых продуктов.',
    icon: 'content_copy',
    tone: 'purple',
  },
  {
    id: 'base',
    title: 'База',
    description: 'Работа с базой гидов, отелей, транспорта и партнеров.',
    icon: 'database',
    tone: 'emerald',
  },
  {
    id: 'roles',
    title: 'Роли и доступ',
    description: 'Настройка прав доступа для сотрудников и внешних агентов.',
    icon: 'admin_panel_settings',
    tone: 'orange',
  },
  {
    id: 'files',
    title: 'Файлы и PDF',
    description: 'Генерация документов, билетов и отчетов в формате PDF.',
    icon: 'description',
    tone: 'pink',
  },
  {
    id: 'payments',
    title: 'Оплата',
    description: 'Интеграции платежных шлюзов, счета и финансовая отчетность.',
    icon: 'payments',
    tone: 'teal',
  },
];

export const popularArticles = [
  { id: 'a1', title: 'Как добавить нового гида в систему?' },
  { id: 'a2', title: 'Настройка автоматических уведомлений для туристов' },
  { id: 'a3', title: 'Интеграция с календарём Google' },
];

export const recentArticles = [
  { id: 'r1', title: 'Обновление модуля "Отели"', time: '2 часа назад' },
  { id: 'r2', title: 'Новые шаблоны PDF документов', time: 'Вчера' },
  { id: 'r3', title: 'Изменение ролей пользователей', time: '3 дня назад' },
];
