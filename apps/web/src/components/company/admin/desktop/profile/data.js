export const profileData = {
  id: '#GK-8821',
  name: 'Марина Коваленко',
  fullName: 'Марина Александровна Коваленко',
  role: 'Admin',
  status: 'Active',
  company: 'Git-Kit LLC',
  joined: '12 Окт, 2021',
  timezone: 'GMT+3 (Moscow)',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQd42_vqG8jEAFlQqkjONFrWA4XPbllbBAnajv7kRvkpktzNqT_24xmOk3HxR4TrhxVmM5lADvGu5yb2zt-PLGS4j9T1OkO1z7a9771vhTIc0HKjHZEnPxl5SIpO9sVxaxv_TNZevAmX8DEUEx6qUq018qODTDZG8b00dtrd2DOXwRBlqcinNZFHP8qpiWyTdIizSXkLfDCuZP2xhnXMvgSozTyKrvdZDr-ywtm3Gtrmrpc4KBFQlrD2yExyiCAgdxUnnz3d-Yelk',
  tags: [
    { label: 'Admin', tone: 'purple' },
    { label: 'Active', tone: 'emerald' },
  ],
  socials: [
    { icon: 'mail' },
    { icon: 'call' },
    { icon: 'chat' },
  ],
  personal: {
    birthDate: '24 Июня 1992',
    city: 'Санкт-Петербург, Россия',
    languages: ['Русский (Native)', 'English (C1)', 'German (B1)'],
  },
  contacts: {
    email: 'marina.k@git-kit.com',
    phone: '+7 (921) 555-01-23',
    telegram: '@marina_gitkit',
  },
  security: {
    passwordMask: '••••••••••••••••',
    twofaEnabled: true,
    sessions: [
      { device: 'Chrome on macOS', location: 'Санкт-Петербург • Сейчас', current: true, icon: 'desktop_mac' },
      { device: 'Safari on iPhone 13', location: 'Санкт-Петербург • 2ч назад', current: false, icon: 'smartphone' },
    ],
  },
  work: {
    position: 'Senior Sales Manager',
    department: 'Продажи (Европа)',
    manager: 'Алексей Смирнов',
    managerAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQd42_vqG8jEAFlQqkjONFrWA4XPbllbBAnajv7kRvkpktzNqT_24xmOk3HxR4TrhxVmM5lADvGu5yb2zt-PLGS4j9T1OkO1z7a9771vhTIc0HKjHZEnPxl5SIpO9sVxaxv_TNZevAmX8DEUEx6qUq018qODTDZG8b00dtrd2DOXwRBlqcinNZFHP8qpiWyTdIizSXkLfDCuZP2xhnXMvgSozTyKrvdZDr-ywtm3Gtrmrpc4KBFQlrD2yExyiCAgdxUnnz3d-Yelk',
    hireDate: '12 Октября 2021',
    tenure: '2 года 4 месяца',
    status: 'Active',
    permissions: [
      { label: 'Дашборд', scope: '(view)', tone: 'emerald' },
      { label: 'Туры', scope: '(create, edit, export)', tone: 'primary' },
      { label: 'База', scope: '(create, edit)', tone: 'primary' },
      { label: 'Финансы', scope: '(view only)', tone: 'warning' },
      { label: 'Сотрудники', scope: '(view)', tone: 'purple' },
      { label: 'Отчеты', scope: '(export)', tone: 'gray' },
    ],
    managerNote:
      'Марина показывает отличные результаты в текущем квартале. Рекомендуется рассмотреть повышение грейда до Team Lead в следующем цикле ревью. Необходимо подтянуть работу с документацией по сложным турам.',
    stats: [
      { title: 'Туры (7 дн)', value: '12', delta: '+20%', tone: 'emerald' },
      { title: 'Туры (30 дн)', value: '48', delta: '+5%', tone: 'emerald' },
      { title: 'Места', value: '96%', delta: '0%', tone: 'neutral' },
      { title: 'Ср. маржа', value: '125k₽', delta: '-2%', tone: 'danger' },
    ],
    activities: [
      { icon: 'add', title: 'Создала тур "Алтай 2024"', time: '2 часа назад', tone: 'primary' },
      { icon: 'edit', title: 'Обновила карточку клиента', time: 'Сегодня, 10:45', tone: 'purple' },
      { icon: 'check_circle', title: 'Закрыла задачу #4421', time: 'Вчера, 18:30', tone: 'emerald' },
      { icon: 'mail', title: 'Отправила 15 приглашений', time: '12 Июня', tone: 'orange' },
      { icon: 'login', title: 'Вход в систему', time: '12 Июня, 09:00', tone: 'gray' },
    ],
    history: [
      { date: '15 Июня 2024', type: 'Тур', typeTone: 'blue', object: 'Алтай-2024 (Группа 2)', desc: 'Изменение стоимости проживания для 3 участников', status: 'Выполнено', statusTone: 'emerald' },
      { date: '14 Июня 2024', type: 'Клиент', typeTone: 'purple', object: 'Иванов А.А.', desc: 'Добавление паспортных данных и визы', status: 'Выполнено', statusTone: 'emerald' },
      { date: '12 Июня 2024', type: 'Задача', typeTone: 'orange', object: 'Подготовка отчета', desc: 'Ежемесячный отчет по продажам в Европе', status: 'В работе', statusTone: 'warning' },
      { date: '10 Июня 2024', type: 'Система', typeTone: 'gray', object: 'Авторизация', desc: 'Вход с нового устройства (MacBook Pro)', status: 'Инфо', statusTone: 'gray' },
    ],
  },
  salary: {
    periodLabel: 'Декабрь 2025',
    payoutDate: '5 Января 2026',
    visibilityNote: 'Данные видны только вам и владельцу',
    status: 'Pending',
    cards: [
      { label: 'Оклад (Gross)', value: '280,000', currency: 'KGS', tone: 'white' },
      { label: 'Бонусы', value: '+45,000', currency: 'KGS', tone: 'emerald' },
      { label: 'Удержания (Налоги)', value: '-32,500', currency: 'KGS', tone: 'red' },
      { label: 'Итого к выплате', value: '292,500', currency: 'KGS', tone: 'primary', updated: 'обновлено сегодня' },
    ],
    breakdown: [
      { label: 'Оклад', percent: 75, tone: 'blue', text: 'Оклад (75%)', width: '75%' },
      { label: 'Бонус', percent: 15, tone: 'emerald', text: 'Бонус (15%)', width: '15%' },
      { label: 'Удержания', percent: 10, tone: 'red', text: 'Удержания (10%)', width: '10%' },
    ],
    detailsMonth: 'Декабрь 2025',
    details: [
      { date: '01 Дек', type: 'Оклад', typeTone: 'blue', title: 'Базовая часть за Декабрь', amount: '280,000', amountTone: 'white', note: 'Согласно контракту' },
      { date: '15 Дек', type: 'Бонус', typeTone: 'emerald', title: 'KPI Q4 Performance', amount: '+35,000', amountTone: 'emerald', note: 'Выполнение планов >110%' },
      { date: '20 Дек', type: 'Бонус', typeTone: 'emerald', title: 'Referral program', amount: '+10,000', amountTone: 'emerald', note: 'Найм Senior Dev' },
      { date: '31 Дек', type: 'Налог', typeTone: 'red', title: 'НДФЛ 13%', amount: '-32,500', amountTone: 'red', note: 'Автоматическое удержание' },
    ],
    total: '292,500',
    payment: {
      recipient: 'Kovalenko Marina A.',
      bank: 'Tinkoff Bank',
      maskedAccount: '•••• 4582',
      currency: 'KGS (Киргизский сом)',
    },
    bonusRules: [
      'Квартальный бонус выплачивается при выполнении 80% KPI.',
      'Бонус за наем сотрудника: 10,000 KGS после исп. срока.',
      '13-я зарплата начисляется в Январе.',
    ],
    history: [
      { period: 'Ноябрь 2025', salary: '280,000', bonus: '+15,000', deductions: '-30,000', total: '265,000', status: 'Paid' },
      { period: 'Октябрь 2025', salary: '280,000', bonus: '—', deductions: '-28,000', total: '252,000', status: 'Paid' },
      { period: 'Сентябрь 2025', salary: '275,000', bonus: '+5,000', deductions: '-28,000', total: '252,000', status: 'Paid' },
    ],
  },
};
